import { ipcMain, dialog, shell, BrowserWindow, app } from 'electron'
import Store from 'electron-store'
import { DangerousPathManager } from './services/DangerousPathManager'
import { FileScanner } from './services/FileScanner'
import { FileOrganizer } from './services/FileOrganizer'
import { SensitiveFileHandler } from './services/SensitiveFileHandler'
import { AppSettings, ScannedFile, ScanResult } from '../shared/types'
import { getCategoryDisplayName } from './models/FileCategory'
import { FileCategory } from '../shared/types'
import path from 'path'
import fs from 'fs'

const store = new Store<{ settings: AppSettings; userPaths: string[] }>({
  defaults: {
    settings: { securityEnabled: false, includeFolders: false, deepScanEnabled: false, deepScanDepth: 2, scanExtensions: ['txt'] },
    userPaths: [],
  },
})

const dangerousPathManager = new DangerousPathManager()
dangerousPathManager.loadUserPaths(store.get('userPaths', []))

const scanner = new FileScanner()
const organizer = new FileOrganizer()
const sensitiveHandler = new SensitiveFileHandler(
  path.join(app.isPackaged ? process.resourcesPath : app.getAppPath(), 'resources', 'BIP39WordList.txt')
)

export function registerIpcHandlers(): void {
  // Wire up progress reporting from organizer to renderer
  organizer.setSendProgress((state) => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) win.webContents.send('organize:progress', state)
  })

  ipcMain.handle('dialog:pick-directory', async () => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return null
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
      title: '选择要整理的目录',
      buttonLabel: '选择',
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('directory:set', (_e, dirPath: string) => {
    if (!dangerousPathManager.isSafe(dirPath)) {
      throw new Error(`"${dirPath}" 是受保护的系统路径，无法整理。`)
    }
  })

  ipcMain.handle('directory:open-in-explorer', (_e, dirPath: string) => {
    shell.openPath(dirPath)
  })

  ipcMain.handle('scan:start', (_e, dir: string, includeFolders: boolean, deepScan: boolean) => {
    const settings = store.get('settings')
    return scanner.scan(dir, includeFolders, deepScan, settings.deepScanDepth ?? 2)
  })

  ipcMain.handle('organize:copy', async (_e, scanResult) => {
    organizer.reset()
    await organizer.copyFiles(scanResult)
  })

  ipcMain.handle('organize:delete-originals', async (_e, scanResult) => {
    await organizer.deleteOriginals(scanResult)
  })

  ipcMain.handle('organize:rollback', async () => {
    await organizer.rollback()
  })

  ipcMain.handle('security:check-private-keys', (_e, files: ScannedFile[]) => {
    const settings = store.get('settings')
    const scanExts = new Set(settings.scanExtensions ?? ['txt'])
    return files.map(f => {
      const ext = path.extname(f.name).slice(1).toLowerCase()
      const shouldCheck = scanExts.has(ext) || f.category === FileCategory.SensitiveConfig
      return {
        ...f,
        containsPrivateKey: shouldCheck ? sensitiveHandler.containsPrivateKey(f.path) : false,
      }
    })
  })

  ipcMain.handle('security:handle-sensitive-files', async (_e, scanResult: ScanResult, password: string) => {
    const sourceDir = scanResult.sourceDirectory

    const allSensitive = (scanResult.categorizedFiles[FileCategory.SensitiveConfig] ?? [])
      .filter(f => f.isSelected)
    const topSensitive = allSensitive.filter(f => !f.fromDeepScan)
    const deepSensitive = allSensitive.filter(f => f.fromDeepScan)

    if (topSensitive.length > 0 || deepSensitive.length > 0) {
      const destDir = path.join(sourceDir, getCategoryDisplayName(FileCategory.SensitiveConfig))
      fs.mkdirSync(destDir, { recursive: true })
      if (topSensitive.length > 0) {
        await sensitiveHandler.encryptAndArchive(
          topSensitive.map(f => f.path), password, path.join(destDir, '敏感配置.zip')
        )
      }
      if (deepSensitive.length > 0) {
        await sensitiveHandler.encryptAndArchive(
          deepSensitive.map(f => f.path), password, path.join(destDir, '敏感配置_深度扫描.zip'), sourceDir
        )
      }
      for (const file of allSensitive) {
        try { fs.unlinkSync(path.join(destDir, file.name)) } catch { /* already removed */ }
      }
    }

    const allPrivateKey: ScannedFile[] = []
    for (const [cat, files] of Object.entries(scanResult.categorizedFiles) as [FileCategory, ScannedFile[]][]) {
      if (cat === FileCategory.SensitiveConfig) continue
      for (const f of files) {
        if (f.isSelected && f.containsPrivateKey) allPrivateKey.push(f)
      }
    }
    const topPrivateKey = allPrivateKey.filter(f => !f.fromDeepScan)
    const deepPrivateKey = allPrivateKey.filter(f => f.fromDeepScan)

    if (topPrivateKey.length > 0 || deepPrivateKey.length > 0) {
      const destDir = path.join(sourceDir, '含私钥文件')
      fs.mkdirSync(destDir, { recursive: true })
      if (topPrivateKey.length > 0) {
        await sensitiveHandler.encryptAndArchive(
          topPrivateKey.map(f => f.path), password, path.join(destDir, '含私钥文件.zip')
        )
      }
      if (deepPrivateKey.length > 0) {
        await sensitiveHandler.encryptAndArchive(
          deepPrivateKey.map(f => f.path), password, path.join(destDir, '含私钥文件_深度扫描.zip'), sourceDir
        )
      }
      for (const file of allPrivateKey) {
        const catDir = path.join(sourceDir, getCategoryDisplayName(file.category))
        try { fs.unlinkSync(path.join(catDir, file.name)) } catch { /* already removed */ }
      }
    }
  })

  ipcMain.handle('settings:get', () => {
    const defaults: AppSettings = { securityEnabled: false, includeFolders: false, deepScanEnabled: false, deepScanDepth: 2, scanExtensions: ['txt'] }
    return { ...defaults, ...store.get('settings') }
  })

  ipcMain.handle('settings:set', (_e, partial: Partial<AppSettings>) => {
    const current = store.get('settings')
    store.set('settings', { ...current, ...partial })
  })

  ipcMain.handle('dangerous-paths:get', () => ({
    defaultPaths: dangerousPathManager.getDefaultPaths(),
    userPaths: dangerousPathManager.getUserPaths(),
  }))

  ipcMain.handle('dangerous-paths:add', (_e, p: string) => {
    dangerousPathManager.addUserPath(p)
    store.set('userPaths', dangerousPathManager.getUserPaths())
  })

  ipcMain.handle('dangerous-paths:remove', (_e, p: string) => {
    dangerousPathManager.removeUserPath(p)
    store.set('userPaths', dangerousPathManager.getUserPaths())
  })
}
