import { describe, it, expect, afterEach } from 'vitest'
import { FileOrganizer } from '../../src/main/services/FileOrganizer'
import { FileCategory, ScannedFile, ScanResult } from '../../src/shared/types'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { v4 as uuid } from 'uuid'

function makeTempDir(): string {
  const dir = path.join(os.tmpdir(), uuid())
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

function createFile(dir: string, name: string, content = 'test'): string {
  const filePath = path.join(dir, name)
  fs.writeFileSync(filePath, content, 'utf-8')
  return filePath
}

function makeScannedFile(filePath: string, category: FileCategory, selected = true): ScannedFile {
  return {
    id: uuid(),
    path: filePath,
    name: path.basename(filePath),
    size: fs.statSync(filePath).size,
    category,
    modificationDate: Date.now(),
    isSelected: selected,
    containsPrivateKey: false,
  }
}

describe('FileOrganizer', () => {
  const dirs: string[] = []

  afterEach(() => {
    for (const d of dirs) fs.rmSync(d, { recursive: true, force: true })
    dirs.length = 0
  })

  it('copies files into category folders', async () => {
    const dir = makeTempDir(); dirs.push(dir)
    const filePath = createFile(dir, 'report.txt', 'hello')
    const scanned = makeScannedFile(filePath, FileCategory.Document)
    const scanResult: ScanResult = { sourceDirectory: dir, categorizedFiles: { [FileCategory.Document]: [scanned] } }

    const organizer = new FileOrganizer()
    await organizer.copyFiles(scanResult)
    expect(fs.existsSync(path.join(dir, '文档', 'report.txt'))).toBe(true)
    expect(fs.existsSync(filePath)).toBe(true)
  })

  it('handles duplicate filenames', async () => {
    const dir = makeTempDir(); dirs.push(dir)
    const filePath = createFile(dir, 'a.txt', 'first')
    const docDir = path.join(dir, '文档')
    fs.mkdirSync(docDir)
    fs.writeFileSync(path.join(docDir, 'a.txt'), 'existing', 'utf-8')

    const scanned = makeScannedFile(filePath, FileCategory.Document)
    const scanResult: ScanResult = { sourceDirectory: dir, categorizedFiles: { [FileCategory.Document]: [scanned] } }

    const organizer = new FileOrganizer()
    await organizer.copyFiles(scanResult)
    expect(fs.existsSync(path.join(docDir, 'a (1).txt'))).toBe(true)
  })

  it('rollback removes copied files and empty directories', async () => {
    const dir = makeTempDir(); dirs.push(dir)
    const filePath = createFile(dir, 'data.csv', 'a,b')
    const scanned = makeScannedFile(filePath, FileCategory.Spreadsheet)
    const scanResult: ScanResult = { sourceDirectory: dir, categorizedFiles: { [FileCategory.Spreadsheet]: [scanned] } }

    const organizer = new FileOrganizer()
    await organizer.copyFiles(scanResult)
    expect(fs.existsSync(path.join(dir, '表格', 'data.csv'))).toBe(true)

    await organizer.rollback()
    expect(fs.existsSync(path.join(dir, '表格'))).toBe(false)
    expect(fs.existsSync(filePath)).toBe(true)
  })

  it('deleteOriginals removes source files', async () => {
    const dir = makeTempDir(); dirs.push(dir)
    const filePath = createFile(dir, 'photo.png', 'img')
    const scanned = makeScannedFile(filePath, FileCategory.Image)
    const scanResult: ScanResult = { sourceDirectory: dir, categorizedFiles: { [FileCategory.Image]: [scanned] } }

    const organizer = new FileOrganizer()
    await organizer.copyFiles(scanResult)
    await organizer.deleteOriginals(scanResult)
    expect(fs.existsSync(filePath)).toBe(false)
    expect(fs.existsSync(path.join(dir, '图片', 'photo.png'))).toBe(true)
  })

  it('skips unselected files', async () => {
    const dir = makeTempDir(); dirs.push(dir)
    const f1 = createFile(dir, 'a.txt', 'yes')
    const f2 = createFile(dir, 'b.txt', 'no')
    const s1 = makeScannedFile(f1, FileCategory.Document, true)
    const s2 = makeScannedFile(f2, FileCategory.Document, false)
    const scanResult: ScanResult = { sourceDirectory: dir, categorizedFiles: { [FileCategory.Document]: [s1, s2] } }

    const organizer = new FileOrganizer()
    await organizer.copyFiles(scanResult)
    expect(fs.existsSync(path.join(dir, '文档', 'a.txt'))).toBe(true)
    expect(fs.existsSync(path.join(dir, '文档', 'b.txt'))).toBe(false)
  })
})
