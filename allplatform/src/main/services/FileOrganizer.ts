import fs from 'fs'
import path from 'path'
import { FileCategory, ScanResult, OrganizerState, Operation } from '../../shared/types'
import { getCategoryDisplayName } from '../models/FileCategory'

export class FileOrganizer {
  private operationLog: Operation[] = []
  private state: OrganizerState = { phase: 'idle' }
  private sendProgress: ((state: OrganizerState) => void) | null = null
  private copyMap: Map<string, string> = new Map()

  setSendProgress(fn: (state: OrganizerState) => void): void {
    this.sendProgress = fn
  }

  getState(): OrganizerState {
    return this.state
  }

  getCopyMap(): Map<string, string> {
    return this.copyMap
  }

  logCreatedFile(filePath: string): void {
    this.operationLog.push({ type: 'createdFile', path: filePath })
  }

  logCreatedDirectory(dirPath: string): void {
    this.operationLog.push({ type: 'createdDirectory', path: dirPath })
  }

  private setState(newState: OrganizerState): void {
    this.state = newState
    if (this.sendProgress) this.sendProgress(newState)
  }

  async copyFiles(scanResult: ScanResult): Promise<void> {
    this.operationLog = []
    this.copyMap = new Map()
    const selectedFiles: { category: FileCategory; file: { id: string; path: string; name: string } }[] = []

    for (const [category, files] of Object.entries(scanResult.categorizedFiles)) {
      if (!files) continue
      for (const file of files) {
        if (!file.isSelected) continue
        if (file.fromDeepScan) continue
        if ((category as FileCategory) === FileCategory.Folder) continue
        selectedFiles.push({ category: category as FileCategory, file: { id: file.id, path: file.path, name: file.name } })
      }
    }

    const total = selectedFiles.length
    if (total === 0) {
      this.setState({ phase: 'waitingConfirmation' })
      return
    }

    for (let i = 0; i < total; i++) {
      const { category, file } = selectedFiles[i]
      const progress = i / total
      this.setState({ phase: 'copying', progress, currentFile: file.name })

      const categoryDir = path.join(scanResult.sourceDirectory, getCategoryDisplayName(category))
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true })
        this.operationLog.push({ type: 'createdDirectory', path: categoryDir })
      }

      const destination = this.uniqueDestination(file.name, categoryDir)
      try {
        fs.copyFileSync(file.path, destination)
        this.operationLog.push({ type: 'copiedFile', source: file.path, destination })
        this.copyMap.set(file.id, destination)
      } catch (err) {
        await this.rollback()
        this.setState({ phase: 'failed', error: (err as Error).message })
        throw err
      }
    }

    this.setState({ phase: 'waitingConfirmation' })
  }

  async deleteOriginals(scanResult: ScanResult): Promise<void> {
    const selectedFiles = Object.values(scanResult.categorizedFiles)
      .flat()
      .filter(f => f && f.isSelected && !f.fromDeepScan && f.category !== FileCategory.Folder)

    const total = selectedFiles.length
    if (total === 0) return

    let totalSize = 0
    for (let i = 0; i < total; i++) {
      const file = selectedFiles[i]!
      this.setState({ phase: 'deleting', progress: i / total, currentFile: file.name })
      fs.unlinkSync(file.path)
      totalSize += file.size
    }

    this.setState({ phase: 'completed', fileCount: total, totalSize })
  }

  async rollback(): Promise<void> {
    for (const op of [...this.operationLog].reverse()) {
      if (op.type === 'copiedFile') {
        try { fs.unlinkSync(op.destination) } catch { /* already removed */ }
      } else if (op.type === 'createdFile') {
        try { fs.unlinkSync(op.path) } catch { /* already removed */ }
      } else if (op.type === 'createdDirectory') {
        try {
          const contents = fs.readdirSync(op.path)
          if (contents.length === 0) fs.rmdirSync(op.path)
        } catch { /* already removed */ }
      }
    }
    this.operationLog = []
    this.copyMap = new Map()
    this.setState({ phase: 'idle' })
  }

  reset(): void {
    this.operationLog = []
    this.copyMap = new Map()
    this.state = { phase: 'idle' }
  }

  private uniqueDestination(filename: string, directory: string): string {
    const ext = path.extname(filename)
    const base = path.basename(filename, ext)
    let candidate = path.join(directory, filename)
    let counter = 1
    while (fs.existsSync(candidate)) {
      const newName = ext ? `${base} (${counter})${ext}` : `${base} (${counter})`
      candidate = path.join(directory, newName)
      counter++
    }
    return candidate
  }
}
