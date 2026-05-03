@echo off
title Claude Tools Manager - Installation
echo.
echo  Claude Tools Manager - Installation
echo  =====================================
echo.

:: Check node
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo  [ERREUR] Node.js non trouve. Installez Node.js 18+ depuis https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo  [OK] Node.js %NODE_VER%

:: Check npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo  [ERREUR] npm non trouve
    pause
    exit /b 1
)

echo  [OK] npm detecte
echo.
echo  Installation des dependances...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo  [ERREUR] npm install a echoue
    pause
    exit /b 1
)

echo.
echo  [OK] Installation terminee !
echo.
echo  Commandes disponibles:
echo    npm run dev         - Lance en mode developpement
echo    npm run build:win   - Build installer Windows
echo    npm run build:all   - Build les 3 plateformes
echo.
echo  Pour lancer: npm run dev
echo.
pause
