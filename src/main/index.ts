import { app, BrowserWindow, nativeTheme } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { setupIPC } from './ipc'

function buildWindowOptions() {
  return {
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    show: false,
    frame: false,
    titleBarStyle: (process.platform === 'darwin' ? 'hiddenInset' : 'hidden') as 'hiddenInset' | 'hidden',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#08080f',
    vibrancy: (process.platform === 'darwin' ? 'under-window' : undefined) as 'under-window' | undefined,
    backgroundMaterial: (process.platform === 'win32' ? 'mica' : undefined) as 'mica' | undefined,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: join(__dirname, '../../resources', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
  }
}

function attachWindowControls(win: BrowserWindow): void {
  win.on('ready-to-show', () => win.show())
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  win.webContents.on('ipc-message', (_event, channel) => {
    if (channel === 'minimize-window') win.minimize()
    if (channel === 'maximize-window') {
      if (win.isMaximized()) win.unmaximize()
      else win.maximize()
    }
    if (channel === 'close-window') win.close()
  })
}

function createWindow(): void {
  nativeTheme.themeSource = 'dark'
  const mainWindow = new BrowserWindow(buildWindowOptions())
  attachWindowControls(mainWindow)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

export function createProfileWindow(profileId: string): void {
  const win = new BrowserWindow(buildWindowOptions())
  attachWindowControls(win)

  const hash = `#profile=${encodeURIComponent(profileId)}`

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'] + hash)
  } else {
    win.loadURL(`file://${join(__dirname, '../renderer/index.html')}${hash}`)
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('fr.creebs.claude-tools-manager')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  setupIPC()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
