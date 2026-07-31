<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

// Increase PHP execution time limit for handling bulk product sync
@ini_set('max_execution_time', 120);
@set_time_limit(120);

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
        "error" => "Invalid product data payload"
    ]);
    exit;
}

// File paths for triple-layer data protection
$jsonPath = __DIR__ . "/js/products-data.json";
$jsPath = __DIR__ . "/js/products-data.js";
$bakPath = __DIR__ . "/js/products-data.bak.json";

$existingProducts = [];

// Layer 1: Read from primary JSON database file
if (file_exists($jsonPath) && filesize($jsonPath) > 10) {
    $parsed = json_decode(file_get_contents($jsonPath), true);
    if (is_array($parsed) && count($parsed) > 0) {
        $existingProducts = $parsed;
    }
}

// Layer 2: Read from JS file if JSON file is missing/empty
if (count($existingProducts) === 0 && file_exists($jsPath) && filesize($jsPath) > 10) {
    $content = file_get_contents($jsPath);
    if (preg_match('/const\s+PRODUCTS_DATA\s*=\s*(\[[\s\S]*?\])\s*;?/', $content, $m)) {
        $parsed = json_decode($m[1], true);
        if (is_array($parsed) && count($parsed) > 0) {
            $existingProducts = $parsed;
        }
    }
}

// Layer 3: Read from Backup file if main files were corrupted
if (count($existingProducts) === 0 && file_exists($bakPath) && filesize($bakPath) > 10) {
    $parsed = json_decode(file_get_contents($bakPath), true);
    if (is_array($parsed) && count($parsed) > 0) {
        $existingProducts = $parsed;
    }
}

// Smart Merge: Key by normalized Title for 100% bulletproof deduplication and infinite appending
function makeTitleKey($str) {
    $clean = mb_strtolower(trim($str), 'UTF-8');
    return preg_replace('/[^\w\d\p{L}]/u', '', $clean);
}

$productMap = [];
foreach ($existingProducts as $idx => $p) {
    if (!isset($p['title']) || empty($p['title'])) continue;
    $tKey = makeTitleKey($p['title']);
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

// Fast Image Downloader (1s strict timeout per image to prevent PHP execution timeout)
$imgDir = __DIR__ . "/images";
if (!file_exists($imgDir)) @mkdir($imgDir, 0755, true);
$baseUrl = "https://shop.saigoncacanh.com/images";

foreach ($finalProducts as &$prod) {
    if (isset($prod['image']) && strpos($prod['image'], 'http') === 0 && strpos($prod['image'], $baseUrl) === false) {
        $remoteImg = $prod['image'];
        $fileHash = md5($prod['id'] . '_' . (isset($prod['title']) ? $prod['title'] : $prod['id']));
        $localFileName = "img_" . $fileHash . ".jpg";
        $localFilePath = $imgDir . "/" . $localFileName;

        if (!file_exists($localFilePath) || filesize($localFilePath) === 0) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $remoteImg);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 1);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 1);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
            $imgBytes = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200 && $imgBytes && strlen($imgBytes) > 500) {
                @file_put_contents($localFilePath, $imgBytes);
            }
        }

        if (file_exists($localFilePath) && filesize($localFilePath) > 500) {
            $prod['image'] = $baseUrl . "/" . $localFileName;
        }
    }
}
unset($prod);

// Save triple-layer data: JSON, Backup JSON, and JS File
$jsonContent = json_encode($finalProducts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
$jsContent = "const PRODUCTS_DATA = " . $jsonContent . ";";

@file_put_contents($jsonPath, $jsonContent);
@file_put_contents($bakPath, $jsonContent);
@file_put_contents($jsPath, $jsContent);

echo json_encode([
    "success" => true, 
    "message" => "Successfully synced " . count($finalProducts) . " total products!",
    "total_count" => count($finalProducts)
]);
?>
