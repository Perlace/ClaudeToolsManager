<div align="center">

<img src="resources/icon.png" alt="Claude Tools Manager" width="100" />

# Claude Tools Manager

**Desktop app to manage Claude Code tools — 50+ tools in 8 categories**

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](package.json)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](#installation)
[![Built with Electron](https://img.shields.io/badge/built%20with-Electron-47848F.svg)](https://www.electronjs.org/)

</div>

---

Claude Tools Manager is an open-source desktop application that lets you activate and manage Claude Code tools with one click. Each tool injects optimized instructions into your `CLAUDE.md` and `settings.json` — no manual editing required.

## Features

- **50+ curated tools** organized in 8 categories
- **One-click toggle** — enable or disable any tool instantly
- **Dark / Light mode** with persistent preference
- **CLAUDE.md viewer** — read your full global prompt directly in the app
- **Import custom tools** from JSON files
- **Live Claude Code detection** — auto-detects your installation (native + WSL)
- **New session launcher** — reload Claude Code with active tools applied
- **Cross-platform** — Windows, macOS, Linux (AppImage + .deb)

## Tool Categories

| Category | Description |
|----------|-------------|
| ⚡ **Super Powers** | Multi-agent orchestration, advanced Claude capabilities |
| 🎨 **Front End Design** | UI/UX generation, component design |
| 🔍 **Code Review** | Analysis, refactoring, code quality |
| 🔒 **Security Review** | Vulnerability detection, OWASP hardening |
| 📈 **SEO Tools** | Search engine optimization |
| 📱 **Responsive Design** | Mobile-first and multi-platform adaptation |
| 🧠 **Claude Memory** | Memory and context management |
| 💰 **Token Savings** | API token optimization |

## Installation

### Windows

Download the `.exe` installer from [Releases](https://github.com/Perlace/ClaudeToolsManager/releases) and run it.

### macOS

Download the `.dmg` from [Releases](https://github.com/Perlace/ClaudeToolsManager/releases), open it, and drag the app to your Applications folder.

### Linux

**Option 1 — Automated installer (AppImage)**

```bash
git clone https://github.com/Perlace/ClaudeToolsManager.git
cd ClaudeToolsManager
bash install-linux.sh
```

The script auto-detects your environment, handles FUSE requirements for Ubuntu 22.04+, and creates a desktop shortcut.

**Option 2 — Manual AppImage**

```bash
chmod +x "Claude Tools Manager-1.1.0.AppImage"
./"Claude Tools Manager-1.1.0.AppImage" --no-sandbox
```

> **Ubuntu 22.04+**: if the AppImage doesn't launch, run `sudo apt-get install libfuse2`

## Build from Source

**Requirements:** Node.js 18+, npm

```bash
git clone https://github.com/Perlace/ClaudeToolsManager.git
cd ClaudeToolsManager
npm install

# Development
npm run dev

# Build
npm run build:win     # Windows
npm run build:mac     # macOS
npm run build:linux   # Linux (AppImage + .deb)
npm run build:all     # All platforms
```

## How It Works

Each tool contains a configuration that can include:
- **`claudeMd`** — instructions appended to your global `CLAUDE.md`
- **`settingsJson`** — permissions added to Claude Code's `settings.json`
- **`commands`** — slash commands installed in your `.claude/commands/` folder

Toggling a tool on/off applies or removes these changes automatically.

## Import Custom Tools

You can import your own tools via **JSON**. Click **Import** in the header and select a `.json` file matching this format:

```json
{
  "id": "my-unique-tool",
  "name": "My Tool",
  "shortDescription": "Short description",
  "description": "Full description...",
  "category": "superpowers",
  "tags": ["tag1", "tag2"],
  "tokenImpact": "saves",
  "tokenEstimate": "-20%",
  "difficulty": "easy",
  "config": {
    "claudeMd": "## My Instructions\n\nContent here..."
  },
  "tips": ["Tip 1", "Tip 2"],
  "isEnabled": false,
  "isImported": true
}
```

Available categories: `superpowers` `frontend` `code-review` `security` `seo` `responsive` `memory` `tokens`

## Contributing

Contributions are welcome! To add a new tool, edit [`src/renderer/src/data/tools.ts`](src/renderer/src/data/tools.ts) and follow the existing structure. Open a PR with a clear description of what the tool does and why it's useful.

## License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">
  Built by <a href="https://creebs.fr">Creebs</a> · <a href="https://github.com/Perlace/ClaudeToolsManager/issues">Report an issue</a>
</div>
