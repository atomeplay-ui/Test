@echo off
REM Galerie de Photos de Mariage - Serveur Python
REM ================================================

cd /d "%~dp0"

echo.
echo ════════════════════════════════════════════════════════════
echo   💒 GALERIE DE PHOTOS DE MARIAGE - Serveur Python
echo ════════════════════════════════════════════════════════════
echo.

REM Vérifier si Python est installé
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERREUR : Python n'est pas installé ou pas dans le PATH
    echo.
    echo Assurez-vous que Python est installé et accessible
    echo.
    pause
    exit /b 1
)

echo ✅ Python détecté
echo.
echo 🚀 Démarrage du serveur Python...
echo 📍 Accédez à : http://localhost:3000
echo.
echo Appuyez sur Ctrl+C pour arrêter le serveur
echo.

python server.py

pause
