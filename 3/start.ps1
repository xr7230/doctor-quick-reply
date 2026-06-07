# Doctor-Patient Communication Assistant Startup Script
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Starting Doctor-Patient Communication Assistant" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Switch to project directory
Write-Host "[1/6] Switching to project directory..." -ForegroundColor Yellow
Set-Location "D:\doctor\2"
Write-Host "Current directory: $(Get-Location)"
Write-Host ""

# Check npm
Write-Host "[2/6] Checking npm environment..." -ForegroundColor Yellow
$npmPath = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npmPath) {
    Write-Host "Error: npm command not found" -ForegroundColor Red
    Write-Host "Please ensure Node.js is properly installed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "npm environment is normal" -ForegroundColor Green
Write-Host ""

# Check dependencies
Write-Host "[3/6] Checking project dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "Dependencies already installed, skipping installation step" -ForegroundColor Green
} else {
    Write-Host "Dependencies not installed, installing..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes, please be patient..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Dependency installation failed, trying with Taobao mirror..." -ForegroundColor Yellow
        npm install --registry=https://registry.npmmirror.com
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Error: Dependency installation failed" -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }
    }
    Write-Host "Dependency installation completed!" -ForegroundColor Green
}
Write-Host ""

# Check port
Write-Host "[4/6] Checking port usage..." -ForegroundColor Yellow
$port = 5173
$portInUse = netstat -an | Select-String ":$port"
if ($portInUse) {
    Write-Host "Port $port is already in use, trying port 5174..." -ForegroundColor Yellow
    $port = 5174
}
Write-Host "Using port: $port" -ForegroundColor Green
Write-Host ""

# Start server
Write-Host "[5/6] Starting Vite development server..." -ForegroundColor Yellow
Write-Host "Please wait, server is starting..." -ForegroundColor Yellow
Write-Host ""

# Start server in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'D:\doctor\2'; npm run dev -- --port $port" -WindowStyle Normal

# Wait for server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if server started successfully
$attempts = 0
$maxAttempts = 10
$serverStarted = $false

while ($attempts -lt $maxAttempts -and -not $serverStarted) {
    $attempts++
    Write-Host "Checking... $attempts/$maxAttempts" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port" -Method HEAD -TimeoutSec 2 -ErrorAction SilentlyContinue -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            $serverStarted = $true
        }
    } catch {
        Start-Sleep -Seconds 1
    }
}

if (-not $serverStarted) {
    Write-Host "Warning: Server may not have started normally" -ForegroundColor Yellow
    Write-Host "Please check the error messages in the newly opened PowerShell window" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Server started successfully!" -ForegroundColor Green
Write-Host ""

# Open browser
Write-Host "[6/6] Opening browser..." -ForegroundColor Yellow

# Check for Edge browser
$edgePaths = @(
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)

$edgeFound = $false
foreach ($edgePath in $edgePaths) {
    if (Test-Path $edgePath) {
        Write-Host "Opening http://localhost:$port with Edge browser" -ForegroundColor Green
        Start-Process $edgePath -ArgumentList "http://localhost:$port"
        $edgeFound = $true
        break
    }
}

if (-not $edgeFound) {
    Write-Host "Opening http://localhost:$port with default browser" -ForegroundColor Green
    Start-Process "http://localhost:$port"
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Startup completed!" -ForegroundColor Green
Write-Host "Server address: http://localhost:$port" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tips:" -ForegroundColor Yellow
Write-Host "- If the browser doesn't open automatically, please visit the address above manually"
Write-Host "- Server is running in a new PowerShell window"
Write-Host "- Press Ctrl+C in that window to stop the server"
Write-Host ""

Read-Host "Press Enter to close this window"
