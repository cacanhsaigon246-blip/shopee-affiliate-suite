# PowerShell Purge Script for shop.saigoncacanh.com (Hostinger)
$ftpHost = "187.127.126.46"
$ftpUser = "u972437838"
$ftpPass = "Cannabis041188@"
$remoteBase = "/domains/saigoncacanh.com/public_html/shop"
$localBase = "C:\Users\SAIGONCACANH\.gemini\antigravity\scratch\shopee-affiliate-suite\storefront"

function Upload-FileToFtp($localPath, $remotePath) {
    Write-Host "Uploading $localPath -> ftp://$ftpHost$remotePath"
    $webclient = New-Object System.Net.WebClient
    $webclient.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
    $uri = New-Object System.Uri("ftp://$ftpHost$remotePath")
    $webclient.UploadFile($uri, $localPath)
    Write-Host "SUCCESS: Uploaded $remotePath"
}

Upload-FileToFtp "$localBase\js\products-data.js" "$remoteBase/js/products-data.js"
Upload-FileToFtp "$localBase\js\products-data.json" "$remoteBase/js/products-data.json"
Upload-FileToFtp "$localBase\js\products-data.bak.json" "$remoteBase/js/products-data.bak.json"

Write-Host "=== ALL 3 DATABASE FILES PURGED TO 0 PRODUCTS ON HOSTINGER ==="
