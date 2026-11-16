Write-Output "Starting backend..."
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "$PSScriptRoot\backend"
Start-Sleep 4

Write-Output "Checking backend..."
try {
    $r = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -TimeoutSec 5
    Write-Output "Backend OK: $($r.Content)"
} catch {
    Write-Output "Backend FAILED to start!"
    exit 1
}

Write-Output ""
Write-Output "Starting frontend..."
Set-Location "$PSScriptRoot\frontend"
npm run dev
