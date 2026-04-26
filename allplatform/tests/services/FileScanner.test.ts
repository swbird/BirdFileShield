import { describe, it, expect, afterEach } from 'vitest'
import { FileScanner } from '../../src/main/services/FileScanner'
import { FileCategory } from '../../src/shared/types'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { v4 as uuid } from 'uuid'

function makeTempDir(): string {
  const dir = path.join(os.tmpdir(), uuid())
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

function createFile(dir: string, name: string, content = 'test'): void {
  fs.writeFileSync(path.join(dir, name), content, 'utf-8')
}

describe('FileScanner', () => {
  const scanner = new FileScanner()
  const dirs: string[] = []

  afterEach(() => {
    for (const d of dirs) fs.rmSync(d, { recursive: true, force: true })
    dirs.length = 0
  })

  it('scans files and categorizes by extension', () => {
    const dir = makeTempDir(); dirs.push(dir)
    createFile(dir, 'report.docx')
    createFile(dir, 'photo.png')
    createFile(dir, 'data.csv')
    createFile(dir, 'unknown.xyz')

    const result = scanner.scan(dir, false)
    const total = Object.values(result.categorizedFiles).reduce((sum, files) => sum + (files?.length ?? 0), 0)
    expect(total).toBe(4)
    expect(result.categorizedFiles[FileCategory.Document]?.length).toBe(1)
    expect(result.categorizedFiles[FileCategory.Image]?.length).toBe(1)
    expect(result.categorizedFiles[FileCategory.Spreadsheet]?.length).toBe(1)
    expect(result.categorizedFiles[FileCategory.Other]?.length).toBe(1)
  })

  it('does not recurse into subdirectories', () => {
    const dir = makeTempDir(); dirs.push(dir)
    createFile(dir, 'top.txt')
    const sub = path.join(dir, 'subfolder')
    fs.mkdirSync(sub)
    createFile(sub, 'nested.txt')

    const result = scanner.scan(dir, false)
    const docs = result.categorizedFiles[FileCategory.Document] ?? []
    expect(docs.length).toBe(1)
    expect(docs[0].name).toBe('top.txt')
  })

  it('includes folders when requested', () => {
    const dir = makeTempDir(); dirs.push(dir)
    createFile(dir, 'file.txt')
    fs.mkdirSync(path.join(dir, 'myFolder'))

    const result = scanner.scan(dir, true)
    expect(result.categorizedFiles[FileCategory.Folder]?.length).toBe(1)
  })

  it('excludes folders when not requested', () => {
    const dir = makeTempDir(); dirs.push(dir)
    fs.mkdirSync(path.join(dir, 'myFolder'))

    const result = scanner.scan(dir, false)
    const folders = result.categorizedFiles[FileCategory.Folder] ?? []
    expect(folders.length).toBe(0)
  })

  it('skips existing category folders', () => {
    const dir = makeTempDir(); dirs.push(dir)
    const docDir = path.join(dir, '文档')
    fs.mkdirSync(docDir)
    createFile(docDir, 'old.txt')
    createFile(dir, 'new.txt')

    const result = scanner.scan(dir, true)
    const folders = result.categorizedFiles[FileCategory.Folder] ?? []
    expect(folders.some(f => f.name === '文档')).toBe(false)
  })

  it('empty directory returns empty result', () => {
    const dir = makeTempDir(); dirs.push(dir)
    const result = scanner.scan(dir, false)
    const total = Object.values(result.categorizedFiles).reduce((sum, files) => sum + (files?.length ?? 0), 0)
    expect(total).toBe(0)
  })

  it('skips hidden files', () => {
    const dir = makeTempDir(); dirs.push(dir)
    createFile(dir, '.DS_Store')
    createFile(dir, '.hidden')
    createFile(dir, 'visible.txt')

    const result = scanner.scan(dir, false)
    const total = Object.values(result.categorizedFiles).reduce((sum, files) => sum + (files?.length ?? 0), 0)
    expect(total).toBe(1)
  })
})
