@echo off
cd /d "%~dp0"
title Claude Tools Manager

:: Verifier si node_modules existe
if not exist "node_modules\" (
    echo  node_modules absent - lancement de npm install...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo  [ERREUR] npm install echoue. Verifiez que Node.js est installe.
        pause
        exit /b 1
    )
)

:: Lancer l'application
start "" npm run dev
