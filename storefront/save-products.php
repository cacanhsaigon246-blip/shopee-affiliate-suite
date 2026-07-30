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

if (!$data || !isset($data['products']) || !is_array($data['products'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid product data payload"]);
    exit;
}

// Process and format javascript file content
$jsContent = "const PRODUCTS_DATA = " . json_encode($data['products'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . ";";

// Write to products-data.js file in the same js/ directory
$filePath = __DIR__ . "/js/products-data.js";
if (file_put_contents($filePath, $jsContent) !== false) {
    echo json_encode(["success" => true, "message" => "Successfully saved " . count($data['products']) . " products to storefront catalog!"]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to write products-data.js file on server"]);
}
?>
