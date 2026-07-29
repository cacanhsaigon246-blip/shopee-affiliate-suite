$ftpHost = "187.127.126.46"
$user = "u972437838"
$pass = "Cannabis041188@"

try {
    $req = [System.Net.FtpWebRequest]::Create("ftp://$ftpHost/")
    $req.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
    $req.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectoryDetails
    $resp = $req.GetResponse()
    $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $content = $reader.ReadToEnd()
    Write-Host "FTP Directory List:"
    Write-Host $content
    $reader.Close()
    $resp.Close()
} catch {
    Write-Error $_
}
