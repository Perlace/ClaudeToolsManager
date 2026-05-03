@echo off
setlocal enabledelayedexpansion
title Claude Tools Manager - Installation complete
color 0A

echo.
echo  ============================================================
echo   Claude Tools Manager - Installation automatique
echo  ============================================================
echo.

:: Verifier si Node.js est deja installe
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
    echo  [OK] Node.js deja installe : !NODE_VER!
    goto :INSTALL_DEPS
)

echo  [INFO] Node.js non detecte. Telechargement en cours...
echo  [INFO] Cela peut prendre 1-2 minutes selon votre connexion.
echo.

:: Telecharger Node.js LTS via PowerShell
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
  "try { ^
    $url = 'https://nodejs.org/dist/v20.19.1/node-v20.19.1-x64.msi'; ^
    $out = '%TEMP%\nodejs_installer.msi'; ^
    Write-Host '  Telechargement de Node.js LTS v20...'; ^
    Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing; ^
    Write-Host '  [OK] Telechargement termine'; ^
  } catch { ^
    Write-Host '  [ERREUR] Echec du telechargement: ' + $_.Exception.Message; ^
    exit 1 ^
  }"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  [ERREUR] Impossible de telecharger Node.js automatiquement.
    echo  [ACTION] Telechargez manuellement depuis : https://nodejs.org
    echo  [ACTION] Choisissez la version LTS, installez, puis relancez ce script.
    pause
    exit /b 1
)

echo  [INFO] Installation de Node.js (une fenetre UAC peut apparaitre)...
msiexec /i "%TEMP%\nodejs_installer.msi" /qn /norestart ADDLOCAL=ALL

if %ERRORLEVEL% NEQ 0 (
    echo  [INFO] Installation silencieuse echouee, lancement de l'installeur graphique...
    start /wait msiexec /i "%TEMP%\nodejs_installer.msi"
)

:: Rafraichir le PATH
call refreshenv 2>nul
set "PATH=%PATH%;C:\Program Files\nodejs;%APPDATA%\npm"

:: Verifier l'installation
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo  [ATTENTION] Node.js installe mais pas encore visible.
    echo  [ACTION] Fermez ce terminal et relancez INSTALLER.bat
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo  [OK] Node.js installe : !NODE_VER!

:INSTALL_DEPS
echo.
echo  [INFO] Installation des dependances npm...
echo  [INFO] Premiere installation : peut prendre 3-5 minutes
echo.

cd /d "%~dp0"
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  [ERREUR] npm install a echoue.
    echo  [INFO] Verifiez votre connexion internet et relancez.
    pause
    exit /b 1
)

echo.
echo  [OK] Dependances installees !
echo.

:: Creer le raccourci de lancement sur le bureau
echo  [INFO] Creation du raccourci sur le bureau...

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
  "$WshShell = New-Object -ComObject WScript.Shell; ^
   $Desktop = [System.Environment]::GetFolderPath('Desktop'); ^
   $Shortcut = $WshShell.CreateShortcut($Desktop + '\Claude Tools Manager.lnk'); ^
   $Shortcut.TargetPath = '%~dp0launch.bat'; ^
   $Shortcut.WorkingDirectory = '%~dp0'; ^
   $Shortcut.Description = 'Claude Tools Manager - Gestionnaire outils Claude Code'; ^
   $Shortcut.IconLocation = '%~dp0resources\icon.svg,0'; ^
   $Shortcut.WindowStyle = 7; ^
   $Shortcut.Save(); ^
   Write-Host '  [OK] Raccourci cree sur le bureau'"

echo.
echo  ============================================================
echo   Installation terminee !
echo  ============================================================
echo.
echo  LANCEMENT :
echo  - Double-cliquez sur "Claude Tools Manager" sur votre bureau
echo  - Ou lancez : npm run dev dans ce dossier
echo.
echo  BARRE DES TACHES :
echo  - Clic droit sur le raccourci du bureau
echo  - "Epingler a la barre des taches"
echo.
echo  MISE A JOUR :
echo  - git pull
echo  - npm install
echo.

set /p LAUNCH="Lancer l'application maintenant ? (O/N) : "
if /i "!LAUNCH!"=="O" (
    start "" "%~dp0launch.bat"
)

pause
