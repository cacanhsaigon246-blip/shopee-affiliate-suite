$ftpHost = "187.127.126.46"
$user = "u972437838"
$pass = "Cannabis041188@"
$localDir = "C:\Users\SAIGONCACANH\.gemini\antigravity\scratch\shopee-affiliate-suite"
$baseRemote = "ftp://$ftpHost/domains/saigoncacanh.com/public_html/aff"

function Create-FtpDir($dirUrl) {
    try {
        $req = [System.Net.FtpWebRequest]::Create($dirUrl)
        $req.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
        $req.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $resp = $req.GetResponse()
        $resp.Close()
        Write-Host "Created FTP dir: $dirUrl"
    } catch {
        # Ignore if directory already exists
    }
}

function Upload-File($localFile, $remoteUrl) {
    try {
        Write-Host "Uploading $localFile -> $remoteUrl"
        $webclient = New-Object System.Net.WebClient
        $webclient.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
        $uri = New-Object System.Uri($remoteUrl)
        $webclient.UploadFile($uri, $localFile)
        Write-Host "SUCCESS: Uploaded $(Split-Path $localFile -Leaf)"
    } catch {
        Write-Error "Failed to upload $localFile : $_"
    }
}

# 1. Create remote folders
Create-FtpDir "$baseRemote"
Create-FtpDir "$baseRemote/css"
Create-FtpDir "$baseRemote/js"

# 2. Upload Web Dashboard core files
Upload-File "$localDir\index.html" "$baseRemote/index.html"
Upload-File "$localDir\css\style.css" "$baseRemote/css/style.css"
Upload-File "$localDir\js\app.js" "$baseRemote/js/app.js"

Write-Host "=== FTP UPLOAD TO HOSTINGER COMPLETED SUCCESSFULLY ==="
