import { create } from 'zustand'
import type { ScanResult, OrganizerState, AppSettings, ScannedFile, FileCategory } from '../../shared/types'

interface AppStore {
  // State
  selectedPage: 'organize' | 'settings'
  appState: 'idle' | 'scanned' | 'organizing' | 'waitingConfirmation' | 'completed'
  targetDirectory: string | null
  scanResult: ScanResult | null
  organizerState: OrganizerState | null
  securityPassword: string
  showPasswordPrompt: boolean
  errorMessage: string | null
  settings: AppSettings

  // Actions
  setSelectedPage: (page: 'organize' | 'settings') => void
  pickDirectory: () => Promise<void>
  setDirectory: (path: string) => Promise<void>
  scan: () => Promise<void>
  toggleFile: (category: FileCategory, fileId: string) => void
  startOrganizing: () => Promise<void>
  setPasswordAndOrganize: (password: string) => Promise<void>
  confirmAndDeleteOriginals: () => Promise<void>
  rollbackOrganizing: () => Promise<void>
  openInExplorer: (path: string) => Promise<void>
  reset: () => void
  dismissError: () => void
  dismissPasswordPrompt: () => void
  loadSettings: () => Promise<void>
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>
}

export const useAppStore = create<AppStore>((set, get) => {
  // Register progress callback once
  if (typeof window !== 'undefined' && window.api) {
    window.api.onProgress((data: OrganizerState) => {
      if (data.phase === 'copying' || data.phase === 'deleting') {
        set({ organizerState: data, appState: 'organizing' })
      } else if (data.phase === 'waitingConfirmation') {
        set({ organizerState: data, appState: 'waitingConfirmation' })
      } else if (data.phase === 'completed') {
        set({ organizerState: data, appState: 'completed' })
      } else if (data.phase === 'failed') {
        set({ organizerState: data, errorMessage: data.error })
      }
    })
    window.api.onStateChange((data: OrganizerState) => {
      if (data.phase === 'copying' || data.phase === 'deleting') {
        set({ organizerState: data, appState: 'organizing' })
      } else if (data.phase === 'waitingConfirmation') {
        set({ organizerState: data, appState: 'waitingConfirmation' })
      } else if (data.phase === 'completed') {
        set({ organizerState: data, appState: 'completed' })
      } else if (data.phase === 'failed') {
        set({ organizerState: data, errorMessage: data.error })
      }
    })
  }

  return {
    // Initial state
    selectedPage: 'organize',
    appState: 'idle',
    targetDirectory: null,
    scanResult: null,
    organizerState: null,
    securityPassword: '',
    showPasswordPrompt: false,
    errorMessage: null,
    settings: { securityEnabled: false, includeFolders: false, deepScanEnabled: false, deepScanDepth: 2, scanExtensions: ['txt'] },

    setSelectedPage: (page) => set({ selectedPage: page }),

    pickDirectory: async () => {
      try {
        const dir = await window.api.pickDirectory()
        if (dir) {
          await window.api.setDirectory(dir)
          set({ targetDirectory: dir, appState: 'idle' })
        }
      } catch (e) {
        set({ errorMessage: String(e) })
      }
    },

    setDirectory: async (path: string) => {
      try {
        await window.api.setDirectory(path)
        set({ targetDirectory: path, appState: 'idle' })
      } catch (e) {
        set({ errorMessage: String(e) })
      }
    },

    scan: async () => {
      const { targetDirectory, settings } = get()
      if (!targetDirectory) return
      try {
        const result = await window.api.scan(targetDirectory, settings.includeFolders, settings.deepScanEnabled)
        // Check private keys for all files
        const allFiles: ScannedFile[] = Object.values(result.categorizedFiles).flat() as ScannedFile[]
        const checkedFiles = await window.api.checkPrivateKeys(allFiles)
        // Rebuild categorizedFiles with checked files
        const checkedMap = new Map(checkedFiles.map((f) => [f.id, f]))
        const updatedCategorized: ScanResult['categorizedFiles'] = {}
        for (const [cat, files] of Object.entries(result.categorizedFiles) as [FileCategory, ScannedFile[]][]) {
          updatedCategorized[cat] = files.map((f) => checkedMap.get(f.id) ?? f)
        }
        set({ scanResult: { ...result, categorizedFiles: updatedCategorized }, appState: 'scanned' })
      } catch (e) {
        set({ errorMessage: String(e) })
      }
    },

    toggleFile: (category: FileCategory, fileId: string) => {
      const { scanResult } = get()
      if (!scanResult) return
      const files = scanResult.categorizedFiles[category]
      if (!files) return
      const updated = files.map((f) => f.id === fileId ? { ...f, isSelected: !f.isSelected } : f)
      set({
        scanResult: {
          ...scanResult,
          categorizedFiles: { ...scanResult.categorizedFiles, [category]: updated }
        }
      })
    },

    startOrganizing: async () => {
      const { settings, scanResult, securityPassword } = get()
      if (!scanResult) return

      const hasSensitive = (() => {
        const sensitiveConfig = (scanResult.categorizedFiles as any)['sensitiveConfig'] as ScannedFile[] | undefined
        const docs = (scanResult.categorizedFiles as any)['document'] as ScannedFile[] | undefined
        const hasSensitiveConfig = sensitiveConfig?.some(f => f.isSelected) ?? false
        const hasPrivateKey = docs?.some(f => f.isSelected && f.containsPrivateKey) ?? false
        return hasSensitiveConfig || hasPrivateKey
      })()

      if (settings.securityEnabled && hasSensitive && !securityPassword) {
        set({ showPasswordPrompt: true })
        return
      }

      try {
        set({ appState: 'organizing', organizerState: { phase: 'copying', progress: 0, currentFile: '' } })
        await window.api.copyFiles(scanResult)
        if (settings.securityEnabled && hasSensitive) {
          await window.api.handleSensitiveFiles(scanResult, securityPassword)
        }
      } catch (e) {
        set({ errorMessage: String(e), appState: 'scanned' })
      }
    },

    setPasswordAndOrganize: async (password: string) => {
      set({ securityPassword: password, showPasswordPrompt: false })
      await get().startOrganizing()
    },

    confirmAndDeleteOriginals: async () => {
      const { scanResult } = get()
      if (!scanResult) return
      try {
        set({ organizerState: { phase: 'deleting', progress: 0, currentFile: '' } })
        await window.api.deleteOriginals(scanResult)
      } catch (e) {
        set({ errorMessage: String(e) })
      }
    },

    rollbackOrganizing: async () => {
      try {
        await window.api.rollback()
        set({ appState: 'scanned', organizerState: null })
      } catch (e) {
        set({ errorMessage: String(e) })
      }
    },

    openInExplorer: async (path: string) => {
      try {
        await window.api.openInExplorer(path)
      } catch (e) {
        set({ errorMessage: String(e) })
      }
    },

    reset: () => set({
      appState: 'idle',
      scanResult: null,
      organizerState: null,
      securityPassword: '',
      showPasswordPrompt: false,
      errorMessage: null,
    }),

    dismissError: () => set({ errorMessage: null }),

    dismissPasswordPrompt: () => set({ showPasswordPrompt: false }),

    loadSettings: async () => {
      try {
        const settings = await window.api.getSettings()
        set({ settings })
      } catch (e) {
        set({ errorMessage: String(e) })
      }
    },

    updateSettings: async (partial: Partial<AppSettings>) => {
      const { settings } = get()
      const next = { ...settings, ...partial }
      set({ settings: next })
      try {
        await window.api.setSettings(partial)
      } catch (e) {
        set({ errorMessage: String(e) })
      }
    },
  }
})
