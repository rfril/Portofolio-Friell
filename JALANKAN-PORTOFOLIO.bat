@echo off
title Portofolio 3D Interaktif Rafriel Raditya Widodo
color 0b
echo =======================================================================
echo   PORTOFOLIO 3D INTERAKTIF GAME DEVELOPER - RAFRIEL RADITYA WIDODO
echo   Siswa RPL SMK Negeri 71 Jakarta
echo =======================================================================
echo.
echo Menjalankan local server...
echo.

cd /d "%~dp0"

where node >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Menjalankan via Node.js server.js...
    node server.js --open
    goto end
)

where python >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Menjalankan via Python HTTP Server...
    start "" http://localhost:3000
    python -m http.server 3000
    goto end
)

echo [INFO] Membuka langsung index.html di browser...
start "" "%~dp0index.html"

:end
pause
