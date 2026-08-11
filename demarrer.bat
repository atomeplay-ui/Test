@echo off
REM Galerie de Photos de Mariage - Fichier de démarrage
REM ====================================================

cd /d "%~dp0"

echo.
echo ════════════════════════════════════════════════════════════
echo   💒 GALERIE DE PHOTOS DE MARIAGE
echo ════════════════════════════════════════════════════════════
echo.
echo 🚀 Démarrage du serveur...
echo.

REM Vérifier si les dépendances sont installées
if not exist "node_modules" (
    echo 📦 Installation des dépendances npm...
    call npm install
    echo.
)

REM Lancer le serveur
echo 🌐 Serveur en cours de démarrage...
echo 📍 Accédez à : http://localhost:3000
echo.
echo Appuyez sur Ctrl+C pour arrêter le serveur
echo.

call npm start

pause
