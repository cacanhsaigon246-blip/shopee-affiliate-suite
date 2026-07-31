<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$jsonPath = __DIR__ . "/js/products-data.json";
$jsPath = __DIR__ . "/js/products-data.js";
$bakPath = __DIR__ . "/js/products-data.bak.json";

$products = [];

// Layer 1: Read from primary JSON file
if (file_exists($jsonPath) && filesize($jsonPath) > 10) {
    $parsed = json_decode(file_get_contents($jsonPath), true);
    if (is_array($parsed) && count($parsed) > 0) {
        $products = $parsed;
    }
}

// Layer 2: Read from JS file if JSON is empty
if (count($products) === 0 && file_exists($jsPath) && filesize($jsPath) > 10) {
    $content = file_get_contents($jsPath);
    if (preg_match('/const\s+PRODUCTS_DATA\s*=\s*(\[[\s\S]*?\])\s*;?/', $content, $m)) {
        $parsed = json_decode($m[1], true);
        if (is_array($parsed) && count($parsed) > 0) {
            $products = $parsed;
        }
    }
}

// Layer 3: Read from Backup file
if (count($products) === 0 && file_exists($bakPath) && filesize($bakPath) > 10) {
    $parsed = json_decode(file_get_contents($bakPath), true);
    if (is_array($parsed) && count($parsed) > 0) {
        $products = $parsed;
    }
}

echo json_encode($products, JSON_UNESCAPED_UNICODE);
?>
