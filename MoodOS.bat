@echo off
title MoodOS - Laptop MoodSwing Desktop App
color 0A

echo ====================================================================
echo               MoodOS - Laptop MoodSwing System
echo                  Native Windows Screen App
echo ====================================================================
echo.
echo [1/3] Checking Node.js runtime environment...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [2/3] Initializing Windows Thermal & Wi-Fi Hardware Telemetry...
echo [3/3] Launching MoodOS Desktop on your screen...
echo.
echo --------------------------------------------------------------------
echo  Features Active:
echo   - Native Windows Window (Frameless with Acrylic Controls)
echo   - Screen Widget Mode (Always-on-top Mini Companion on Screen)
echo   - Screen Climate Overlay (Live Weather across your monitor)
echo   - Real Windows Wallpaper Sync (PowerShell SystemParametersInfo)
echo --------------------------------------------------------------------
echo.

npm run desktop

pause
