<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Security verification using PIN
$token = isset($_GET['token']) ? $_GET['token'] : '';
if ($token !== '041188') {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Unauthorized token"]);
    exit;
}

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data && isset($_POST['payload'])) {
    $data = json_decode($_POST['payload'], true);
}
if (!$data && isset($_POST['products'])) {
    $data = ['products' => is_string($_POST['products']) ? json_decode($_POST['products'], true) : $_POST['products']];
}

if (!$data || !isset($data['products']) || !is_array($data['products']) || count($data['products']) === 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false, 
        "error" => "Invalid product data payload",
        "raw_input" => substr($input, 0, 200),
        "post_keys" => array_keys($_POST)
    ]);
    exit;
}

// Read existing products if file exists
$filePath = __DIR__ . "/js/products-data.js";
$existingProducts = [];

if (file_exists($filePath)) {
    $existingContent = file_get_contents($filePath);
    // Extract JSON array from "const PRODUCTS_DATA = [...];"
    if (preg_match('/const\s+PRODUCTS_DATA\s*=\s*(\[[\s\S]*?\])\s*;?/', $existingContent, $matches)) {
        $parsed = json_decode($matches[1], true);
        if (is_array($parsed)) {
            $existingProducts = $parsed;
        }
    }
}

$mode = isset($data['mode']) ? $data['mode'] : 'append'; // 'append' or 'replace'
$finalProducts = [];

if ($mode === 'replace' || count($existingProducts) === 0) {
    $finalProducts = $data['products'];
} else {
    // Smart Merge: Key by normalized Title to ensure bulletproof deduplication & seamless appending
    function makeTitleKey($str) {
        $clean = mb_strtolower(trim($str), 'UTF-8');
        return preg_replace('/[^\w\d\p{L}]/u', '', $clean);
    }

    $productMap = [];
    foreach ($existingProducts as $idx => $p) {
        $tKey = (isset($p['title']) && !empty($p['title'])) ? makeTitleKey($p['title']) : ('idx_' . $idx);
        $productMap[$tKey] = $p;
    }

    foreach ($data['products'] as $newP) {
        if (!isset($newP['title']) || empty(trim($newP['title']))) continue;
        $tKey = makeTitleKey($newP['title']);

        if (isset($productMap[$tKey])) {
            // Update existing entry with new image/price/link
            $productMap[$tKey] = array_merge($productMap[$tKey], array_filter($newP));
        } else {
            // Brand new product entry -> Append
            $newP['id'] = 'sp-' . (count($productMap) + 1);
            $productMap[$tKey] = $newP;
        }
    }

    $finalProducts = array_values($productMap);
}

// -------------------------------------------------------------
// AUTOMATIC IMAGE DOWNLOADER & LOCAL HOSTING (Hostinger /images/)
// -------------------------------------------------------------
$imgDir = __DIR__ . "/images";
if (!file_exists($imgDir)) {
    @mkdir($imgDir, 0755, true);
}

$baseUrl = "https://shop.saigoncacanh.com/images";

foreach ($finalProducts as &$prod) {
    if (isset($prod['image']) && strpos($prod['image'], 'http') === 0 && strpos($prod['image'], $baseUrl) === false) {
        $remoteImg = $prod['image'];
        // Hash filename to avoid collisions
        $fileHash = md5($prod['id'] . '_' . (isset($prod['title']) ? $prod['title'] : $prod['id']));
        $localFileName = "img_" . $fileHash . ".jpg";
        $localFilePath = $imgDir . "/" . $localFileName;

        // Download image if not already cached locally
        if (!file_exists($localFilePath) || filesize($localFilePath) === 0) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $remoteImg);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            $imgBytes = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200 && $imgBytes && strlen($imgBytes) > 500) {
                @file_put_contents($localFilePath, $imgBytes);
            }
        }

        // If local file was saved successfully, point product.image to local URL
        if (file_exists($localFilePath) && filesize($localFilePath) > 500) {
            $prod['image'] = $baseUrl . "/" . $localFileName;
        }
    }
}
unset($prod); // break reference

// Process and format javascript file content
$jsContent = "const PRODUCTS_DATA = " . json_encode($finalProducts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . ";";

// Write to products-data.js file in the same js/ directory
if (file_put_contents($filePath, $jsContent) !== false) {
    echo json_encode([
        "success" => true, 
        "message" => "Successfully synced " . count($finalProducts) . " total products (Mode: " . $mode . ") to storefront catalog!",
        "total_count" => count($finalProducts)
    ]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to write products-data.js file on server"]);
}
?>
