<?php
header("Access-Control-Allow-Origin: *");

$u = isset($_GET['u']) ? $_GET['u'] : '';
if ($u) {
    // Decode base64 URL
    $decoded = base64_decode(str_replace(array('-', '_'), array('+', '/'), $u));
    if ($decoded && (strpos($decoded, 'http://') === 0 || strpos($decoded, 'https://') === 0)) {
        header("Location: " . $decoded, true, 302);
        exit;
    }
}

// Fallback to store home
header("Location: https://shop.saigoncacanh.com", true, 302);
exit;
?>
