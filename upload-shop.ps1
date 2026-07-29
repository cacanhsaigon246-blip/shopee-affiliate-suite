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

# Upload files
Upload-FileToFtp "$localBase\index.html" "$remoteBase/index.html"
Upload-FileToFtp "$localBase\css\shop.css" "$remoteBase/css/shop.css"
Upload-FileToFtp "$localBase\js\products-data.js" "$remoteBase/js/products-data.js"
Upload-FileToFtp "$localBase\js\shop.js" "$remoteBase/js/shop.js"

Write-Host "=== FTP UPLOAD TO SHOP.SAIGONCACANH.COM COMPLETED SUCCESSFULLY ==="
