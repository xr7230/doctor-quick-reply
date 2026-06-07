@echo off
chcp 65001 >nul

REM ==========================================
REM 医患沟通助手启动脚本
REM ==========================================

echo [1/4] Switching to D drive...
D:
if errorlevel 1 (
    echo ERROR: Cannot switch to D drive
    pause
    exit /b 1
)

echo [2/4] Entering project directory...
cd "D:\doctor\2"
if errorlevel 1 (
    echo ERROR: Cannot enter project directory
    pause
    exit /b 1
)

echo [3/4] Current directory: %cd%

echo [4/4] Starting Vite dev server...
echo.
echo Server will start at http://localhost:5173
echo.

REM Start server in new window
start "Vite Server" cmd /k "D: && cd "D:\doctor\2" && npm run dev"

echo.
echo Waiting 5 seconds for server to start...
timeout /t 5 /nobreak >nul

echo Opening browser...
start "" "http://localhost:5173"

echo.
echo ==========================================
echo Startup complete!
echo ==========================================
echo.
pause