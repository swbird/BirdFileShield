import fs from 'fs'
import path from 'path'
import { v4 as uuid } from 'uuid'
import { FileCategory, ScannedFile, ScanResult } from '../../shared/types'
import { getCategoryFromExtension, getAllDisplayNames } from '../models/FileCategory'

const categoryFolderNames = new Set(getAllDisplayNames())

const SENSITIVE_DOTFILES = new Set([
  '.env', '.env.local', '.env.production', '.env.development', '.env.staging',
  '.npmrc', '.pypirc', '.netrc', '.pgpass', '.my.cnf',
])

const TEXT_CATEGORIES = new Set([
  FileCategory.Document,
  FileCategory.Code,
  FileCategory.SensitiveConfig,
  FileCategory.Other,
])

const DEFAULT_MAX_DEPTH = 2

export class FileScanner {
  scan(directory: string, includeFolders: boolean, deepScan: boolean = false, maxDepth: number = DEFAULT_MAX_DEPTH): ScanResult {
    const categorized: Partial<Record<FileCategory, ScannedFile[]>> = {}
    this.scanTopLevel(directory, categorized, includeFolders)
    if (deepScan) {
      this.scanSubdirectories(directory, directory, categorized, 0, maxDepth)
    }
    return { sourceDirectory: directory, categorizedFiles: categorized }
  }

  private scanTopLevel(
    directory: string,
    categorized: Partial<Record<FileCategory, ScannedFile[]>>,
    includeFolders: boolean
  ): void {
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      const isSensitiveDotfile = SENSITIVE_DOTFILES.has(entry.name)
      if (entry.name.startsWith('.') && !isSensitiveDotfile) continue

      const fullPath = path.join(directory, entry.name)
      let stat: fs.Stats
      try {
        stat = fs.statSync(fullPath)
      } catch {
        continue
      }

      if (stat.isDirectory()) {
        if (categoryFolderNames.has(entry.name)) continue
        if (includeFolders) {
          const file: ScannedFile = {
            id: uuid(),
            path: fullPath,
            name: entry.name,
            size: this.directorySize(fullPath),
            category: FileCategory.Folder,
            modificationDate: stat.mtimeMs,
            isSelected: false,
            containsPrivateKey: false,
            fromDeepScan: false,
          }
          if (!categorized[FileCategory.Folder]) categorized[FileCategory.Folder] = []
          categorized[FileCategory.Folder]!.push(file)
        }
        continue
      }

      const ext = path.extname(entry.name).slice(1)
      const category = isSensitiveDotfile ? FileCategory.SensitiveConfig : getCategoryFromExtension(ext)

      const file: ScannedFile = {
        id: uuid(),
        path: fullPath,
        name: entry.name,
        size: stat.size,
        category,
        modificationDate: stat.mtimeMs,
        isSelected: true,
        containsPrivateKey: false,
        fromDeepScan: false,
      }
      if (!categorized[category]) categorized[category] = []
      categorized[category]!.push(file)
    }
  }

  private scanSubdirectories(
    rootDir: string,
    currentDir: string,
    categorized: Partial<Record<FileCategory, ScannedFile[]>>,
    depth: number,
    maxDepth: number
  ): void {
    if (depth >= maxDepth) return

    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      const isSensitiveDotfile = SENSITIVE_DOTFILES.has(entry.name)
      if (entry.name.startsWith('.') && !isSensitiveDotfile) continue
      const fullPath = path.join(currentDir, entry.name)

      if (entry.isDirectory()) {
        if (categoryFolderNames.has(entry.name)) continue
        try {
          const lstat = fs.lstatSync(fullPath)
          if (lstat.isSymbolicLink()) continue
        } catch {
          continue
        }
        this.scanSubdirectories(rootDir, fullPath, categorized, depth + 1, maxDepth)
        continue
      }

      if (currentDir === rootDir) continue

      const ext = path.extname(entry.name).slice(1)
      const category = isSensitiveDotfile ? FileCategory.SensitiveConfig : getCategoryFromExtension(ext)
      if (!TEXT_CATEGORIES.has(category)) continue

      let stat: fs.Stats
      try {
        stat = fs.statSync(fullPath)
      } catch {
        continue
      }

      const file: ScannedFile = {
        id: uuid(),
        path: fullPath,
        name: entry.name,
        size: stat.size,
        category,
        modificationDate: stat.mtimeMs,
        isSelected: false,
        containsPrivateKey: false,
        fromDeepScan: true,
      }
      if (!categorized[category]) categorized[category] = []
      categorized[category]!.push(file)
    }
  }

  private directorySize(dirPath: string): number {
    let total = 0
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue
        const fullPath = path.join(dirPath, entry.name)
        try {
          const stat = fs.statSync(fullPath)
          if (stat.isDirectory()) {
            total += this.directorySize(fullPath)
          } else {
            total += stat.size
          }
        } catch { /* skip inaccessible */ }
      }
    } catch { /* skip inaccessible */ }
    return total
  }
}
