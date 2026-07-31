<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$token = isset($_GET['token']) ? $_GET['token'] : '';
if ($token !== '041188') {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Unauthorized token"]);
    exit;
}

$jsonPath = __DIR__ . "/js/products-data.json";
$jsPath = __DIR__ . "/js/products-data.js";
$bakPath = __DIR__ . "/js/products-data.bak.json";

$emptyJs = "const PRODUCTS_DATA = [];";
$emptyJson = "[]";

@file_put_contents($jsonPath, $emptyJson);
@file_put_contents($bakPath, $emptyJson);
@file_put_contents($jsPath, $emptyJs);

if (function_exists('opcache_reset')) {
    @opcache_reset();
}

echo json_encode([
    "success" => true,
    "message" => "All storefront product database files successfully purged to 0 products!"
]);
?>
