$ftpHost = "187.127.126.46"
$user = "u972437838"
$pass = "Cannabis041188@"

try {
    $req = [System.Net.FtpWebRequest]::Create("ftp://$ftpHost/domains")
    $req.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
    $req.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectoryDetails
    $resp = $req.GetResponse()
    $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
    Write-Host "Domains Directory List:"
    Write-Host $reader.ReadToEnd()
    $reader.Close()
    $resp.Close()
} catch {
    Write-Error $_
}
