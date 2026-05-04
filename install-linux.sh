#!/bin/bash
# Claude Tools Manager — Linux Installer
# Usage: bash install-linux.sh

set -e

APP_NAME="Claude Tools Manager"
INSTALL_DIR="$HOME/.local/share/claude-tools-manager"
BIN_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"

echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║       Claude Tools Manager               ║"
echo "  ║       Linux Installer                    ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""

# Detect if AppImage is present
APPIMAGE=$(find "$(dirname "$0")/dist" -name "*.AppImage" 2>/dev/null | head -1)

if [ -z "$APPIMAGE" ]; then
    echo "❌ Aucun AppImage trouvé dans dist/"
    echo ""
    echo "Pour builder d'abord :"
    echo "  npm run build:linux"
    echo ""
    exit 1
fi

APPIMAGE_NAME=$(basename "$APPIMAGE")
echo "📦 AppImage détecté: $APPIMAGE_NAME"
echo ""

# Create install directory
mkdir -p "$INSTALL_DIR"
mkdir -p "$BIN_DIR"
mkdir -p "$DESKTOP_DIR"

# Copy AppImage
echo "📂 Copie dans $INSTALL_DIR..."
cp "$APPIMAGE" "$INSTALL_DIR/$APPIMAGE_NAME"
chmod +x "$INSTALL_DIR/$APPIMAGE_NAME"

# Copy icon
ICON_SRC="$(dirname "$0")/resources/icon.png"
if [ -f "$ICON_SRC" ]; then
    mkdir -p "$HOME/.local/share/icons/hicolor/512x512/apps"
    cp "$ICON_SRC" "$HOME/.local/share/icons/hicolor/512x512/apps/claude-tools-manager.png"
    echo "🎨 Icône installée"
fi

# Create launcher symlink
ln -sf "$INSTALL_DIR/$APPIMAGE_NAME" "$BIN_DIR/claude-tools-manager"
echo "🔗 Launcher: $BIN_DIR/claude-tools-manager"

# Create .desktop file for app menu
cat > "$DESKTOP_DIR/claude-tools-manager.desktop" << DESKTOP
[Desktop Entry]
Version=1.1
Name=Claude Tools Manager
Comment=Gestionnaire d'outils Claude Code — 50 outils en 8 catégories
Exec=$INSTALL_DIR/$APPIMAGE_NAME --no-sandbox
Icon=claude-tools-manager
Terminal=false
Type=Application
Categories=Development;Utility;
Keywords=claude;ai;tools;code;anthropic;
StartupWMClass=claude-tools-manager
DESKTOP

chmod +x "$DESKTOP_DIR/claude-tools-manager.desktop"

# Update desktop database
if command -v update-desktop-database &>/dev/null; then
    update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
fi
if command -v gtk-update-icon-cache &>/dev/null; then
    gtk-update-icon-cache "$HOME/.local/share/icons/hicolor" 2>/dev/null || true
fi

echo ""
echo "✅ Installation terminée !"
echo ""
echo "  Lancer depuis le terminal  : claude-tools-manager"
echo "  Lancer depuis le menu apps : chercher 'Claude Tools'"
echo ""

# Check if BIN_DIR is in PATH
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
    echo "⚠️  $BIN_DIR n'est pas dans votre PATH."
    echo "   Ajoutez cette ligne à votre ~/.bashrc ou ~/.zshrc :"
    echo "   export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo ""
fi
