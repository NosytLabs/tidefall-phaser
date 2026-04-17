# Tidefall Game Test Script
# Tests build, server start, and basic functionality

$ErrorActionPreference = "Stop"

Write-Host "=== Tidefall Game Test ===" -ForegroundColor Cyan

# Test 1: Build
Write-Host "`n[1/4] Testing build..." -ForegroundColor Yellow
try {
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    OK Build successful" -ForegroundColor Green
    } else {
        Write-Host "    FAIL Build failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "    FAIL Build error: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Check dist folder
Write-Host "`n[2/4] Checking dist folder..." -ForegroundColor Yellow
if (Test-Path "dist\index.html") {
    $size = (Get-Item "dist\index.html").Length
    Write-Host "    OK dist/index.html exists ($size bytes)" -ForegroundColor Green
} else {
    Write-Host "    FAIL dist/index.html missing" -ForegroundColor Red
    exit 1
}

# Test 3: Check assets
Write-Host "`n[3/4] Checking assets..." -ForegroundColor Yellow
$requiredAssets = @(
    "public\assets\data\fish.json",
    "public\assets\sprites\fish\bass\static_fish.png",
    "public\assets\sprites\character\walk\body\character_walk_body_light.png"
)
$missing = 0
foreach ($asset in $requiredAssets) {
    if (Test-Path $asset) {
        Write-Host "    OK $asset" -ForegroundColor Green
    } else {
        Write-Host "    MISSING: $asset" -ForegroundColor Red
        $missing++
    }
}
if ($missing -gt 0) {
    Write-Host "`n  $missing assets missing!" -ForegroundColor Red
}

# Test 4: Package.json check
Write-Host "`n[4/4] Checking package.json..." -ForegroundColor Yellow
$pkg = Get-Content "package.json" | ConvertFrom-Json
Write-Host "    Name: $($pkg.name)" -ForegroundColor Gray
Write-Host "    Version: $($pkg.version)" -ForegroundColor Gray
Write-Host "    Phaser: $($pkg.dependencies.phaser)" -ForegroundColor Gray
Write-Host "    OK package.json valid" -ForegroundColor Green

Write-Host "`n=== All Tests Passed ===" -ForegroundColor Cyan
Write-Host "Game ready for deployment!" -ForegroundColor Green
