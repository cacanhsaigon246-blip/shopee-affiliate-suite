# PowerShell FTP Uploader for shop.saigoncacanh.com (Hostinger)
$ftpHost = "187.127.126.46"
$ftpUser = "u972437838"
$ftpPass = "Cannabis041188@"
$remoteBase = "/domains/saigoncacanh.com/public_html/shop"
$localBase = "C:\Users\SAIGONCACANH\.gemini\antigravity\scratch\shopee-affiliate-suite\storefront"

function Ensure-FtpDirectory($remoteDirPath) {
    $dirs = $remoteDirPath.Split('/')
    $current = ""
    foreach ($d in $dirs) {
        if ([string]::IsNullOrWhiteSpace($d)) { continue }
        $current += "/" + $d
        $url = "ftp://$ftpHost$current"
        try {
            $req = [System.Net.FtpWebRequest]::Create($url)
            $req.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
            $req.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
            $resp = $req.GetResponse()
            $resp.Close()
            Write-Host "Created remote directory: $current"
        } catch {
            # Directory usually already exists
        }
    }
}

function Upload-FileToFtp($localPath, $remotePath) {
    Write-Host "Uploading $localPath -> ftp://$ftpHost$remotePath"
    $webclient = New-Object System.Net.WebClient
    $webclient.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
    $uri = New-Object System.Uri("ftp://$ftpHost$remotePath")
    $webclient.UploadFile($uri, $localPath)
    Write-Host "SUCCESS: Uploaded $remotePath"
}

# Ensure base directory exists
Ensure-FtpDirectory "$remoteBase"
Ensure-FtpDirectory "$remoteBase/css"
Ensure-FtpDirectory "$remoteBase/js"
Ensure-FtpDirectory "$remoteBase/images"

# Upload files (NOTE: products-data.js is EXCLUDED to protect live product database on Hostinger!)
Upload-FileToFtp "$localBase\index.html" "$remoteBase/index.html"
Upload-FileToFtp "$localBase\css\shop.css" "$remoteBase/css/shop.css"
# Upload-FileToFtp "$localBase\js\products-data.js" "$remoteBase/js/products-data.js" <-- PROTECTED LIVE DATABASE
Upload-FileToFtp "$localBase\js\shop.js" "$remoteBase/js/shop.js"
Upload-FileToFtp "$localBase\save-products.php" "$remoteBase/save-products.php"
Upload-FileToFtp "$localBase\get-products.php" "$remoteBase/get-products.php"
Upload-FileToFtp "$localBase\purge.php" "$remoteBase/purge.php"
Upload-FileToFtp "$localBase\shorten.php" "$remoteBase/shorten.php"
Upload-FileToFtp "$localBase\r.php" "$remoteBase/r.php"

Write-Host "=== FTP UPLOAD TO SHOP.SAIGONCACANH.COM COMPLETED SUCCESSFULLY ==="
