<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$statsFile = __DIR__ . '/click-stats.json';
$productsFile = __DIR__ . '/js/products-data.json';

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

// Read products catalog for mapping details
$productsMap = [];
if (file_exists($productsFile) && filesize($productsFile) > 0) {
    $prods = json_decode(file_get_contents($productsFile), true);
    if (is_array($prods)) {
        foreach ($prods as $p) {
            if (isset($p['id'])) {
                $productsMap[$p['id']] = $p;
            }
        }
    }
}

// Build Top Clicked Products list
$topProducts = [];
if (isset($stats['product_clicks']) && is_array($stats['product_clicks'])) {
    arsort($stats['product_clicks']);
    $count = 0;
    foreach ($stats['product_clicks'] as $pId => $clickCount) {
        if ($count >= 15) break;
        $info = $productsMap[$pId] ?? [
            'id' => $pId,
            'title' => 'Sản phẩm ' . $pId,
            'price' => 'Deal Hot',
            'image' => 'https://via.placeholder.com/150',
            'categoryName' => 'Phụ Kiện'
        ];
        $topProducts[] = [
            'id' => $pId,
            'clicks' => $clickCount,
            'title' => $info['title'] ?? 'Sản phẩm',
            'price' => $info['price'] ?? 'Deal Hot',
            'image' => $info['image'] ?? '',
            'categoryName' => $info['categoryName'] ?? 'Phụ Kiện',
            'shopeeUrl' => $info['shopeeUrl'] ?? '#'
        ];
        $count++;
    }
}

// Fill last 7 days chart data
$chartLabels = [];
$chartData = [];
for ($i = 6; $i >= 0; $i--) {
    $dayStr = date('Y-m-d', strtotime("-$i days"));
    $chartLabels[] = date('d/m', strtotime("-$i days"));
    $chartData[] = $stats['daily_clicks'][$dayStr] ?? 0;
}

echo json_encode([
    'success' => true,
    'total_clicks' => $stats['total_clicks'],
    'total_products' => count($productsMap),
    'chart' => [
        'labels' => $chartLabels,
        'data' => $chartData
    ],
    'top_products' => $topProducts
], JSON_UNESCAPED_UNICODE);
?>
