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

# Check for .deb package first (preferred on Debian/Ubuntu — no FUSE required)
DEB_PKG=$(find "$(dirname "$0")/dist" -name "*amd64*.deb" -o -name "*x64*.deb" 2>/dev/null | head -1)
if [ -n "$DEB_PKG" ]; then
    echo "📦 Paquet .deb détecté: $(basename "$DEB_PKG")"
    echo "   Installation via dpkg (recommandé, pas besoin de FUSE)..."
    echo ""
    if command -v sudo &>/dev/null; then
        sudo dpkg -i "$DEB_PKG" && echo "✅ Installation .deb réussie !" && exit 0
        echo "⚠️  dpkg a échoué, tentative de résolution des dépendances..."
        sudo apt-get install -f -y 2>/dev/null && echo "✅ Dépendances résolues !" && exit 0
    else
        echo "⚠️  sudo non disponible, tentative sans privilèges..."
    fi
    echo ""
fi

# Check FUSE2 availability for AppImage (required on Ubuntu 22.04+)
FUSE_OK=false
APPIMAGE_EXTRA_FLAGS=""
if ldconfig -p 2>/dev/null | grep -q "libfuse.so.2"; then
    FUSE_OK=true
elif [ -f /usr/lib/x86_64-linux-gnu/libfuse.so.2 ] || [ -f /usr/lib/libfuse.so.2 ]; then
    FUSE_OK=true
fi

if [ "$FUSE_OK" = false ]; then
    echo "⚠️  libfuse2 non détecté (requis par AppImage sur Ubuntu 22.04+)."
    echo ""
    echo "   Pour installer libfuse2 :"
    echo "   sudo apt-get install libfuse2"
    echo ""
    echo "   Ou utiliser le mode sans FUSE (extraction temporaire) :"
    echo "   L'installation continuera avec --appimage-extract-and-run"
    echo ""
    APPIMAGE_EXTRA_FLAGS="--appimage-extract-and-run"
fi

# Detect if AppImage is present — prefer x64, fallback to first found
APPIMAGE=$(find "$(dirname "$0")/dist" -name "*x64*.AppImage" -o -name "*amd64*.AppImage" 2>/dev/null | head -1)
if [ -z "$APPIMAGE" ]; then
    APPIMAGE=$(find "$(dirname "$0")/dist" -name "*.AppImage" 2>/dev/null | grep -v arm64 | head -1)
fi
if [ -z "$APPIMAGE" ]; then
    echo "❌ Aucun AppImage trouvé dans dist/"
    echo ""
    echo "Pour builder d'abord :"
    echo "  npm run build:linux"
    echo ""
    exit 1
fi

APPIMAGE_ORIG=$(basename "$APPIMAGE")
APPIMAGE_DEST="claude-tools-manager.AppImage"
echo "📦 AppImage détecté: $APPIMAGE_ORIG"
echo ""

# Create install directory
mkdir -p "$INSTALL_DIR"
mkdir -p "$BIN_DIR"
mkdir -p "$DESKTOP_DIR"

# Copy AppImage — nom fixe sans espaces pour compatibilité .desktop
echo "📂 Copie dans $INSTALL_DIR..."
cp "$APPIMAGE" "$INSTALL_DIR/$APPIMAGE_DEST"
chmod +x "$INSTALL_DIR/$APPIMAGE_DEST"

ICON_PATH="$HOME/.local/share/icons/hicolor/512x512/apps/claude-tools-manager.png"

# Copy icon
ICON_SRC="$(dirname "$0")/resources/icon.png"
if [ -f "$ICON_SRC" ]; then
    mkdir -p "$(dirname "$ICON_PATH")"
    cp "$ICON_SRC" "$ICON_PATH"
    echo "🎨 Icône installée"
fi

# Create launcher symlink
ln -sf "$INSTALL_DIR/$APPIMAGE_DEST" "$BIN_DIR/claude-tools-manager"
echo "🔗 Launcher: $BIN_DIR/claude-tools-manager"

# Create .desktop file for app menu
# Exec et Icon utilisent des chemins absolus sans espaces (requis par XFCE/GNOME)
cat > "$DESKTOP_DIR/claude-tools-manager.desktop" << DESKTOP
[Desktop Entry]
Version=1.1
Name=Claude Tools Manager
Comment=Gestionnaire d'outils Claude Code — 50 outils en 8 catégories
Exec=$INSTALL_DIR/$APPIMAGE_DEST $APPIMAGE_EXTRA_FLAGS --no-sandbox
Icon=$ICON_PATH
Terminal=false
Type=Application
Categories=Development;Utility;
Keywords=claude;ai;tools;code;anthropic;
StartupWMClass=claude-tools-manager
DESKTOP

chmod +x "$DESKTOP_DIR/claude-tools-manager.desktop"

# Create desktop shortcut
DESKTOP_SHORTCUT="$(xdg-user-dir DESKTOP 2>/dev/null || echo "$HOME/Desktop")/ClaudeToolsManager.desktop"
cp "$DESKTOP_DIR/claude-tools-manager.desktop" "$DESKTOP_SHORTCUT"
chmod +x "$DESKTOP_SHORTCUT"
gio set "$DESKTOP_SHORTCUT" metadata::trusted true 2>/dev/null || true
echo "🖥️  Raccourci bureau: $DESKTOP_SHORTCUT"

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
echo "  Lancer depuis le bureau    : double-clic sur l'icône"
echo ""

# Check if BIN_DIR is in PATH
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
    echo "⚠️  $BIN_DIR n'est pas dans votre PATH."
    echo "   Ajoutez cette ligne à votre ~/.bashrc ou ~/.zshrc :"
    echo "   export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo ""
fi

if [ "$FUSE_OK" = false ]; then
    echo "ℹ️  L'app tourne en mode --appimage-extract-and-run (pas de FUSE)."
    echo "   Pour de meilleures performances : sudo apt-get install libfuse2"
    echo ""
fi
