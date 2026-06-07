@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo   医患沟通助手 V3.0 启动中...
echo ========================================
echo.
npm install
echo.
echo 启动开发服务器...
echo.
npm run dev
