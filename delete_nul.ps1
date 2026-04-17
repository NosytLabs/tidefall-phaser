# Delete nul file using Windows API
$path = "C:\Users\Tyson\clawd\tidefall-phaser\nul"

# Try multiple methods
# Method 1: Direct delete
Remove-Item -Path $path -Force -ErrorAction SilentlyContinue

# Method 2: Using cmd with \\?\ prefix
& cmd /c "del \\?\$path 2>nul"

# Method 3: Using robocopy to overwrite with empty folder
$emptyDir = "C:\Windows\Temp\empty"
if (-not (Test-Path $emptyDir)) { New-Item -ItemType Directory -Path $emptyDir -Force | Out-Null }
& robocopy $emptyDir (Split-Path $path) /MIR /XF *.* 2>&1 | Out-Null

Write-Host "Attempted deletion"
