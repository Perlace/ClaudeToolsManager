#!/bin/bash
set -e

echo "🚀 Claude Tools Manager — Installation"
echo "======================================="

# Check node
if ! command -v node &>/dev/null; then
  echo "❌ Node.js non trouvé. Installez Node.js 18+ depuis https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ requis. Version actuelle: $(node -v)"
  exit 1
fi

echo "✅ Node.js $(node -v)"

# Check npm
if ! command -v npm &>/dev/null; then
  echo "❌ npm non trouvé"
  exit 1
fi

echo "✅ npm $(npm -v)"

# Install dependencies
echo ""
echo "📦 Installation des dépendances..."
npm install

echo ""
echo "✅ Installation terminée!"
echo ""
echo "Commandes disponibles:"
echo "  npm run dev          — Lance en mode développement"
echo "  npm run build:linux  — Build AppImage Linux"
echo "  npm run build:win    — Build installer Windows"
echo "  npm run build:mac    — Build DMG macOS"
echo "  npm run build:all    — Build les 3 plateformes"
echo ""
echo "Pour lancer l'application:"
echo "  npm run dev"
