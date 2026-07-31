<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$productId = isset($_REQUEST['id']) ? trim($_REQUEST['id']) : '';
if (empty($productId)) {
    echo json_encode(['success' => false, 'error' => 'Missing product ID']);
    exit;
}

$statsFile = __DIR__ . '/click-stats.json';
$stats = [
    'total_clicks' => 0,
    'daily_clicks' => [],
    'product_clicks' => []
];

if (file_exists($statsFile) && filesize($statsFile) > 0) {
    $parsed = json_decode(file_get_contents($statsFile), true);
    if (is_array($parsed)) {
        $stats = array_merge($stats, $parsed);
    }
}

// Increment total clicks
$stats['total_clicks'] = ($stats['total_clicks'] ?? 0) + 1;

// Increment daily clicks for today (YYYY-MM-DD)
$today = date('Y-m-d');
$stats['daily_clicks'][$today] = ($stats['daily_clicks'][$today] ?? 0) + 1;

// Increment product clicks for this product ID
$stats['product_clicks'][$productId] = ($stats['product_clicks'][$productId] ?? 0) + 1;

// Keep only last 30 days of daily clicks
if (count($stats['daily_clicks']) > 30) {
    ksort($stats['daily_clicks']);
    $stats['daily_clicks'] = array_slice($stats['daily_clicks'], -30, 30, true);
}

// Save back to JSON file
file_put_contents($statsFile, json_encode($stats, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode(['success' => true, 'total_clicks' => $stats['total_clicks'], 'product_clicks' => $stats['product_clicks'][$productId]]);
?>
