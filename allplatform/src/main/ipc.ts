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
  path.join(app.getAppPath(), 'resources', 'BIP39WordList.txt')
)

export function registerIpcHandlers(): void {
  // Wire up progress reporting from organizer to renderer
  organizer.setSendProgress((state) => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) win.webContents.send('organize:progress', state)
  })

  ipcMain.handle('window:minimize', () => {
    BrowserWindow.getFocusedWindow()?.minimize()
  })
  ipcMain.handle('window:maximize', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) win.isMaximized() ? win.unmaximize() : win.maximize()
  })
  ipcMain.handle('window:close', () => {
    BrowserWindow.getFocusedWindow()?.close()
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
    if (!dangerousPathManager.isSafe(dir)) {
      throw new Error(`"${dir}" 是受保护的系统路径，无法扫描。`)
    }
    const settings = store.get('settings')
    return scanner.scan(dir, includeFolders, deepScan, settings.deepScanDepth ?? 2)
  })

  ipcMain.handle('organize:copy', async (_e, scanResult) => {
    organizer.reset()
    await organizer.copyFiles(scanResult)
    return Object.fromEntries(organizer.getCopyMap())
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
    const copyMap = organizer.getCopyMap()

    const allSensitive = (scanResult.categorizedFiles[FileCategory.SensitiveConfig] ?? [])
      .filter(f => f.isSelected)
    const topSensitive = allSensitive.filter(f => !f.fromDeepScan)
    const deepSensitive = allSensitive.filter(f => f.fromDeepScan)

    if (topSensitive.length > 0 || deepSensitive.length > 0) {
      const destDir = path.join(sourceDir, getCategoryDisplayName(FileCategory.SensitiveConfig))
      fs.mkdirSync(destDir, { recursive: true })
      organizer.logCreatedDirectory(destDir)
      if (topSensitive.length > 0) {
        const copiedPaths = topSensitive.map(f => {
          const dest = copyMap.get(f.id)
          if (!dest) throw new Error(`敏感文件 "${f.name}" 未找到复制目标，中止处理以保护原文件。`)
          return dest
        })
        const zipPath = path.join(destDir, '敏感配置.zip')
        await sensitiveHandler.encryptAndArchive(copiedPaths, password, zipPath)
        organizer.logCreatedFile(zipPath)
        for (const p of copiedPaths) {
          try { fs.unlinkSync(p) } catch { /* already removed */ }
        }
      }
      if (deepSensitive.length > 0) {
        const zipPath = path.join(destDir, '敏感配置_深度扫描.zip')
        await sensitiveHandler.encryptAndArchive(
          deepSensitive.map(f => f.path), password, zipPath, sourceDir
        )
        organizer.logCreatedFile(zipPath)
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
      organizer.logCreatedDirectory(destDir)
      if (topPrivateKey.length > 0) {
        const copiedPaths = topPrivateKey.map(f => {
          const dest = copyMap.get(f.id)
          if (!dest) throw new Error(`含私钥文件 "${f.name}" 未找到复制目标，中止处理以保护原文件。`)
          return dest
        })
        const zipPath = path.join(destDir, '含私钥文件.zip')
        await sensitiveHandler.encryptAndArchive(copiedPaths, password, zipPath)
        organizer.logCreatedFile(zipPath)
        for (const p of copiedPaths) {
          try { fs.unlinkSync(p) } catch { /* already removed */ }
        }
      }
      if (deepPrivateKey.length > 0) {
        const zipPath = path.join(destDir, '含私钥文件_深度扫描.zip')
        await sensitiveHandler.encryptAndArchive(
          deepPrivateKey.map(f => f.path), password, zipPath, sourceDir
        )
        organizer.logCreatedFile(zipPath)
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
