<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

function removeVietnameseTones($str) {
    $str = mb_strtolower($str, 'UTF-8');
    $str = preg_replace("/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/", 'a', $str);
    $str = preg_replace("/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/", 'e', $str);
    $str = preg_replace("/(ì|í|ị|ỉ|ĩ)/", 'i', $str);
    $str = preg_replace("/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/", 'o', $str);
    $str = preg_replace("/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/", 'u', $str);
    $str = preg_replace("/(ỳ|ý|ỵ|ỷ|ỹ)/", 'y', $str);
    $str = preg_replace("/(đ)/", 'd', $str);
    return $str;
}

function formatPrice($priceStr) {
    if (!$priceStr) return 'Deal Ngon Shopee';
    $clean = str_replace(['₫', 'đ', 'Giá'], '', $priceStr);
    $clean = trim($clean);
    $num = floatval($clean);
    if ($num > 0 && $num < 1000) {
        $num = $num * 10000;
    }
    if ($num > 0) {
        return number_format(round($num), 0, ',', '.') . 'đ';
    }
    return $priceStr;
}

function generateShortlink($rawUrl, $productId, $affId = '17384730538') {
    if (!$rawUrl) return 'https://shop.saigoncacanh.com';
    if (strpos($rawUrl, 'shop.saigoncacanh.com/r.php?u=') !== false) {
        return $rawUrl;
    }
    $targetUrl = $rawUrl;
    if (strpos($rawUrl, 's.shopee.vn/an_redir') === false) {
        $encoded = urlencode($rawUrl);
        $targetUrl = "https://s.shopee.vn/an_redir?origin_link={$encoded}&affiliate_id={$affId}&sub_id=chatbot-recommend";
    }
    $b64 = rtrim(strtr(base64_encode($targetUrl), '+/', '-_'), '=');
    return "https://shop.saigoncacanh.com/r.php?u={$b64}";
}

$dataFile = __DIR__ . '/js/products-data.json';
if (!file_exists($dataFile)) {
    echo json_encode(['success' => false, 'error' => 'Product database not found']);
    exit;
}

$json = file_get_contents($dataFile);
$products = json_decode($json, true);

if (!is_array($products)) {
    $products = [];
}

$activeProducts = array_filter($products, function($p) {
    return isset($p['status']) ? $p['status'] === 'active' : true;
});

$query = isset($_GET['q']) ? trim($_GET['q']) : '';
$cat = isset($_GET['cat']) ? trim($_GET['cat']) : '';
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
if ($limit <= 0 || $limit > 50) $limit = 10;

$cleanQuery = removeVietnameseTones($query);

$results = [];
foreach ($activeProducts as $item) {
    if ($cat !== '' && $cat !== 'all') {
        if (isset($item['category']) && $item['category'] !== $cat) {
            continue;
        }
    }

    if ($cleanQuery !== '') {
        $titleClean = removeVietnameseTones(isset($item['title']) ? $item['title'] : '');
        $catClean = removeVietnameseTones(isset($item['categoryName']) ? $item['categoryName'] : '');
        if (strpos($titleClean, $cleanQuery) === false && strpos($catClean, $cleanQuery) === false) {
            continue;
        }
    }

    $results[] = [
        'id' => isset($item['id']) ? $item['id'] : '',
        'title' => isset($item['title']) ? $item['title'] : '',
        'price' => formatPrice(isset($item['price']) ? $item['price'] : ''),
        'category' => isset($item['categoryName']) ? $item['categoryName'] : 'Phụ Kiện',
        'affiliate_link' => generateShortlink(isset($item['shopeeUrl']) ? $item['shopeeUrl'] : '', isset($item['id']) ? $item['id'] : ''),
        'image' => isset($item['image']) ? $item['image'] : ''
    ];

    if (count($results) >= $limit) {
        break;
    }
}

echo json_encode([
    'success' => true,
    'query' => $query,
    'total_matches' => count($results),
    'products' => $results
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
