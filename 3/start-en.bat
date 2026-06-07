@echo off
chcp 65001 >nul

echo ==========================================
echo Starting Doctor-Patient Communication Assistant
echo ==========================================
echo.

echo [Step 1] Switch to D drive...
D:
if errorlevel 1 (
    echo ERROR: Cannot switch to D drive
    pause
    exit /b 1
)

echo [Step 2] Enter project directory...
cd "D:\doctor\2"
if errorlevel 1 (
    echo ERROR: Cannot enter project directory
    pause
    exit /b 1
)

echo [Step 3] Current directory: %cd%

echo [Step 4] Start Vite dev server...
echo.
echo Server will start at http://localhost:5173
echo.

start "Vite Server" cmd /k "D: && cd \"D:\doctor\2\" && npm run dev"

echo.
echo Waiting 5 seconds...
timeout /t 5 /nobreak >nul

echo Opening browser...
start "" "http://localhost:5173"

echo.
echo ==========================================
echo Startup complete!
echo ==========================================
echo.
pause