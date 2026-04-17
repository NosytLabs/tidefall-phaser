# Kill vite processes
Get-Process | Where-Object { $_.Name -eq "node" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 2

# Start dev server in background
Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d C:\Users\Tyson\clawd\tidefall-phaser && npm run dev" -NoNewWindow
Start-Sleep 8

# Run test
& node C:\Users\Tyson\clawd\tidefall-phaser\test_game.js