param(
  [string]$LocalDir = "out",
  [string]$RemoteDir = $env:FTP_REMOTE_DIR
)

$ErrorActionPreference = "Stop"

function Import-DotEnv([string]$path) {
  if (-not (Test-Path $path)) { return }
  Get-Content $path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#") -or -not $line.Contains("=")) { return }
    $key, $value = $line.Split("=", 2)
    $key = $key.Trim()
    $value = $value.Trim().Trim('"').Trim("'")
    if ($key) {
      [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
  }
}

Import-DotEnv ".env"

$hostName = $env:FTP_HOST
$userName = $env:FTP_USER
$password = $env:FTP_PASSWORD

if (-not $hostName -or -not $userName -or -not $password) {
  throw "FTP_HOST, FTP_USER, FTP_PASSWORD environment variables are required."
}

if (-not $RemoteDir) {
  $RemoteDir = "/"
}

$root = Resolve-Path $LocalDir
$credential = New-Object System.Net.NetworkCredential($userName, $password)

function Join-FtpPath([string]$base, [string]$child) {
  $left = $base.TrimEnd("/")
  $right = $child.TrimStart("/")
  if (-not $left) { return "/$right" }
  if (-not $right) { return $left }
  return "$left/$right"
}

function Ensure-FtpDirectory([string]$path) {
  $parts = $path.Trim("/").Split("/", [System.StringSplitOptions]::RemoveEmptyEntries)
  $current = ""
  foreach ($part in $parts) {
    $current = Join-FtpPath $current $part
    $uri = "ftp://$hostName$current"
    try {
      $request = [System.Net.FtpWebRequest]::Create($uri)
      $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
      $request.Credentials = $credential
      $request.UseBinary = $true
      $response = $request.GetResponse()
      $response.Close()
    } catch [System.Net.WebException] {
      $response = $_.Exception.Response
      if ($response) { $response.Close() }
    }
  }
}

function Upload-File([string]$filePath) {
  $relative = [System.IO.Path]::GetRelativePath($root, $filePath).Replace("\", "/")
  $remotePath = Join-FtpPath $RemoteDir $relative
  $remoteFolder = Split-Path $remotePath -Parent
  if ($remoteFolder) {
    Ensure-FtpDirectory $remoteFolder.Replace("\", "/")
  }

  $uri = "ftp://$hostName$remotePath"
  $request = [System.Net.FtpWebRequest]::Create($uri)
  $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
  $request.Credentials = $credential
  $request.UseBinary = $true
  $bytes = [System.IO.File]::ReadAllBytes($filePath)
  $request.ContentLength = $bytes.Length
  $stream = $request.GetRequestStream()
  $stream.Write($bytes, 0, $bytes.Length)
  $stream.Close()
  $response = $request.GetResponse()
  $response.Close()
  Write-Host "Uploaded $relative"
}

Ensure-FtpDirectory $RemoteDir
Get-ChildItem -Path $root -Recurse -File | ForEach-Object {
  Upload-File $_.FullName
}

Write-Host "FTP deploy complete: $LocalDir -> ftp://$hostName$RemoteDir"
