<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: text/plain");

$url = isset($_GET['url']) ? $_GET['url'] : '';
if (!$url) {
    echo "Error: URL is missing";
    exit;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://ulvis.net/api.php?url=" . urlencode($url));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
$result = curl_exec($ch);
$http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_status === 200 && $result && strpos(trim($result), 'http') === 0) {
    echo trim($result);
} else {
    // Return original url if ulvis fails
    echo $url;
}
?>
