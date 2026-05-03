# Claude Tools Manager — Démarrage Rapide

## Prérequis

- **Node.js 18+** : https://nodejs.org (choisir la version LTS)
- **Git** (optionnel, pour les mises à jour)

---

## Installation (toutes plateformes)

### Windows

1. Ouvrez **PowerShell** ou **Invite de commandes** dans ce dossier
2. Faites un clic droit dans le dossier → "Ouvrir dans le Terminal"
3. Tapez :
   ```
   npm install
   npm run dev
   ```

### macOS / Linux

1. Ouvrez un terminal
2. Naviguez vers ce dossier :
   ```bash
   cd "chemin/vers/ClaudeToolsManager"
   ```
3. Tapez :
   ```bash
   npm install
   npm run dev
   ```

---

## Construire les exécutables

```bash
# Windows (.exe installer NSIS)
npm run build:win

# macOS (.dmg)
npm run build:mac

# Linux (.AppImage + .deb)
npm run build:linux

# Les 3 en même temps
npm run build:all
```

Les exécutables sont dans le dossier `dist/`.

---

## Structure de l'application

```
ClaudeToolsManager/
├── src/
│   ├── main/          ← Processus Electron (Node.js)
│   │   ├── index.ts   ← Fenêtre principale
│   │   ├── ipc.ts     ← Communication main↔renderer
│   │   └── services/  ← Logique métier
│   │       ├── claudeDetector.ts  ← Détection Claude Code
│   │       ├── toolManager.ts     ← Activation/désactivation outils
│   │       └── sessionManager.ts  ← Gestion des sessions
│   ├── preload/       ← Bridge sécurisé IPC
│   └── renderer/      ← Interface React (ce que vous voyez)
│       └── src/
│           ├── data/tools.ts      ← Définitions des 50 outils
│           ├── store/toolStore.ts ← État global (Zustand)
│           └── components/        ← Composants UI
├── resources/         ← Icônes
├── examples/          ← Outils JSON personnalisés exemples
└── dist/              ← Exécutables compilés (après build)
```

---

## Ajouter vos propres outils

1. Créez un fichier JSON en suivant le format dans `examples/custom-tool-symfony.json`
2. Dans l'app, cliquez sur **Importer** (haut à droite)
3. Sélectionnez votre fichier JSON
4. L'outil apparaît dans sa catégorie, prêt à être activé

---

## Ce que font les outils quand activés

Quand vous activez un outil, l'app modifie **automatiquement** :

- **`~/.claude/settings.json`** — Si l'outil configure des hooks ou serveurs MCP
- **`~/CLAUDE.md`** — Ajoute des instructions dans une section dédiée `<!-- CLAUDE-TOOLS-MANAGER -->`
- **`~/.claude/commands/`** — Crée des commandes slash (ex: `/deep-review`, `/audit-deps`)

Quand vous désactivez, toutes les modifications sont annulées proprement.

---

## Recharger les sessions

Le bouton **Recharger** en haut à droite :
1. Détecte les sessions Claude Code actives
2. Les redémarre pour appliquer les nouveaux outils
3. Si impossible, vous informe de redémarrer manuellement

---

## Mises à jour

```bash
git pull
npm install
npm run build:win  # ou :mac ou :linux
```

---

## Compatibilité

| OS | Format | Architecture |
|---|---|---|
| Windows 10/11 | `.exe` (NSIS) | x64, ARM64 |
| macOS 12+ | `.dmg` | x64 (Intel), ARM64 (M1/M2/M3) |
| Ubuntu/Debian 20.04+ | `.AppImage`, `.deb` | x64, ARM64 |
| Autres Linux | `.AppImage` | x64 |
