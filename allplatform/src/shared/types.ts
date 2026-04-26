export enum FileCategory {
  Document = 'document',
  Pdf = 'pdf',
  Spreadsheet = 'spreadsheet',
  Presentation = 'presentation',
  Image = 'image',
  AudioVideo = 'audioVideo',
  Installer = 'installer',
  Archive = 'archive',
  Torrent = 'torrent',
  Code = 'code',
  Design = 'design',
  Font = 'font',
  Database = 'database',
  Ebook = 'ebook',
  SensitiveConfig = 'sensitiveConfig',
  Folder = 'folder',
  Other = 'other',
}

export interface ScannedFile {
  id: string
  path: string
  name: string
  size: number
  category: FileCategory
  modificationDate: number
  isSelected: boolean
  containsPrivateKey: boolean
  fromDeepScan: boolean
}

export interface ScanResult {
  sourceDirectory: string
  categorizedFiles: Partial<Record<FileCategory, ScannedFile[]>>
}

export type OrganizerState =
  | { phase: 'idle' }
  | { phase: 'copying'; progress: number; currentFile: string }
  | { phase: 'waitingConfirmation' }
  | { phase: 'deleting'; progress: number; currentFile: string }
  | { phase: 'completed'; fileCount: number; totalSize: number }
  | { phase: 'failed'; error: string }

export type Operation =
  | { type: 'createdDirectory'; path: string }
  | { type: 'copiedFile'; source: string; destination: string }

export interface AppSettings {
  securityEnabled: boolean
  includeFolders: boolean
  deepScanEnabled: boolean
  deepScanDepth: number
  scanExtensions: string[]
}

export interface ElectronAPI {
  pickDirectory: () => Promise<string | null>
  setDirectory: (path: string) => Promise<void>
  scan: (dir: string, includeFolders: boolean, deepScan: boolean) => Promise<ScanResult>
  copyFiles: (scanResult: ScanResult) => Promise<void>
  deleteOriginals: () => Promise<void>
  rollback: () => Promise<void>
  checkPrivateKeys: (files: ScannedFile[]) => Promise<ScannedFile[]>
  handleSensitiveFiles: (scanResult: ScanResult, password: string) => Promise<void>
  getSettings: () => Promise<AppSettings>
  setSettings: (settings: Partial<AppSettings>) => Promise<void>
  getDangerousPaths: () => Promise<{ defaultPaths: string[]; userPaths: string[] }>
  addDangerousPath: (path: string) => Promise<void>
  removeDangerousPath: (path: string) => Promise<void>
  openInExplorer: (path: string) => Promise<void>
  onProgress: (callback: (data: OrganizerState) => void) => void
  onStateChange: (callback: (data: OrganizerState) => void) => void
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
