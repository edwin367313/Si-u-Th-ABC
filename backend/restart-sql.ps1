# Script to restart SQL Server with Administrator privileges
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  RESTART SQL SERVER" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "⏳ Stopping SQL Server..." -ForegroundColor Yellow
    Stop-Service MSSQLSERVER -Force -ErrorAction Stop
    
    Write-Host "⏳ Waiting 3 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    Write-Host "⏳ Starting SQL Server..." -ForegroundColor Yellow
    Start-Service MSSQLSERVER -ErrorAction Stop
    
    Write-Host ""
    Write-Host "✅ SQL Server restarted successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "TCP/IP is now enabled on port 1433" -ForegroundColor Cyan
    Write-Host "You can now start the backend server!" -ForegroundColor Green
    
} catch {
    Write-Host ""
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  Please run this script as Administrator:" -ForegroundColor Yellow
    Write-Host "   1. Right-click PowerShell" -ForegroundColor White
    Write-Host "   2. Choose 'Run as Administrator'" -ForegroundColor White
    Write-Host "   3. Run: cd 'c:\tailieuhoc\Kho dữ liệu và khai phá\SIEUTHIABC\backend'" -ForegroundColor White
    Write-Host "   4. Run: .\restart-sql.ps1" -ForegroundColor White
}
