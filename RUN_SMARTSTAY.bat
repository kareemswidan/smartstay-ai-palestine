@echo off
chcp 65001 >nul
cd /d "%~dp0"
title SmartStay AI
echo.
echo ========================================
echo          SmartStay AI - Local
echo ========================================
echo.
where node >nul 2>nul || (
  echo Node.js غير مثبت. ثبّت Node.js 22 ثم أعد المحاولة.
  pause
  exit /b 1
)
if not exist "node_modules" (
  echo جاري تثبيت مكونات المشروع لأول مرة...
  call npm.cmd install
)
start "" cmd /c "timeout /t 5 /nobreak >nul & start http://localhost:3000"
echo سيتم فتح المشروع على http://localhost:3000
echo اترك هذه النافذة مفتوحة، ولإيقاف المشروع اضغط Ctrl+C
echo.
call npm.cmd run dev
