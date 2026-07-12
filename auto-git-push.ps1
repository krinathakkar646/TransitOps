# RouteX Auto-Push Script for Windows PowerShell
# This script automatically checks for updates, commits, and pushes to GitHub every 1 hour.

$interval = 3600

Write-Host "========================================="
Write-Host "    RouteX Auto-Push Sync Agent"
Write-Host "========================================="
Write-Host "Syncing modifications to GitHub every hour."
Write-Host "Press Ctrl + C to exit."
Write-Host "========================================="

while ($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] Checking for modifications..."
    
    $status = git status --porcelain
    if ($status) {
        Write-Host "[$timestamp] Changes detected. Uploading..."
        git add .
        git commit -m "Auto-backup: $timestamp"
        Write-Host "[$timestamp] Fetching and merging remote updates to avoid collisions..."
        git pull --rebase origin main
        git push origin main
        if ($LASTEXITCODE -eq 0) {
            Write-Host "OK: Upload complete!"
        } else {
            Write-Host "ERROR: Push failed. Check connection."
        }
    } else {
        Write-Host "OK: Workspace in sync. Next check in 1 hour."
    }
    
    Start-Sleep -Seconds $interval
}
