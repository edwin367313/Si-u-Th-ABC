# Check for Administrator privileges
if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "⚠️  This script requires Administrator privileges to configure SQL Server." -ForegroundColor Yellow
    Write-Host "   Please right-click this file and select 'Run with PowerShell' -> 'Run as Administrator'" -ForegroundColor White
    Write-Host "   OR run PowerShell as Administrator and execute this script." -ForegroundColor White
    
    # Attempt to self-elevate
    $choice = Read-Host "Do you want to attempt to restart this script as Administrator? (Y/N)"
    if ($choice -eq 'Y' -or $choice -eq 'y') {
        Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
        Exit
    } else {
        Write-Error "Script cannot proceed without Admin privileges."
        Exit
    }
}

Write-Host "🚀 Starting Full Project Fix & Launch..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# 1. Enable TCP/IP for SQL Server
Write-Host "`n[1/4] Configuring SQL Server..." -ForegroundColor Cyan
try {
    [System.Reflection.Assembly]::LoadWithPartialName("Microsoft.SqlServer.SqlWmiManagement") | Out-Null
    $wmi = New-Object Microsoft.SqlServer.Management.Smo.Wmi.ManagedComputer localhost
    
    # Check MSSQLSERVER (Default Instance)
    $instanceName = "MSSQLSERVER"
    if ($wmi.ServerInstances.Contains($instanceName)) {
        $tcp = $wmi.ServerInstances[$instanceName].ServerProtocols['Tcp']
        if ($tcp) {
            if ($tcp.IsEnabled -eq $false) {
                Write-Host "   Enabling TCP/IP for $instanceName..." -ForegroundColor Yellow
                $tcp.IsEnabled = $true
                $tcp.Alter()
                $needsRestart = $true
            } else {
                Write-Host "   TCP/IP is already enabled." -ForegroundColor Green
            }
            
            # Set Port 1433
            $ipAll = $tcp.IPAddresses['IPAll']
            if ($ipAll.IPAddressProperties['TcpPort'].Value -ne '1433') {
                Write-Host "   Setting TCP Port to 1433..." -ForegroundColor Yellow
                $ipAll.IPAddressProperties['TcpPort'].Value = '1433'
                $tcp.Alter()
                $needsRestart = $true
            }
        }
    } else {
        Write-Host "   Default instance MSSQLSERVER not found. Checking for other instances..." -ForegroundColor Yellow
        # You might need to handle named instances here if needed
    }

    if ($needsRestart) {
        Write-Host "   Restarting SQL Server Service..." -ForegroundColor Yellow
        Restart-Service "MSSQLSERVER" -Force
        Write-Host "   ✅ SQL Server restarted." -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Error configuring SQL Server: $_" -ForegroundColor Red
    Write-Host "   Please ensure SQL Server is installed and you are running as Admin." -ForegroundColor Red
}

# 2. Verify Backend Connection
Write-Host "`n[2/4] Verifying Backend Connection..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\backend"
try {
    node test-connection-detailed.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Backend connection verified!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Backend connection failed. Please check the logs above." -ForegroundColor Red
        # Don't exit, let the user see the error
    }
} catch {
    Write-Host "   ❌ Error running test script." -ForegroundColor Red
}

# 3. Start Backend
Write-Host "`n[3/4] Starting Backend Server..." -ForegroundColor Cyan
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm start" -PassThru
Write-Host "   Backend started with PID: $($backendProcess.Id)" -ForegroundColor Green

# 4. Start Frontend
Write-Host "`n[4/4] Starting Frontend..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\Nam_frontend"
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\Nam_frontend'; npm run dev" -PassThru
Write-Host "   Frontend started with PID: $($frontendProcess.Id)" -ForegroundColor Green

Write-Host "`n✅ All services started! Opening browser..." -ForegroundColor Green
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"

