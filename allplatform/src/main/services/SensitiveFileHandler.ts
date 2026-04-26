import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import * as XLSX from 'xlsx'

const PEM_PATTERN = /-----BEGIN[\s\S]*?PRIVATE KEY-----/
const ETH_KEY_PATTERN = /\b0x[0-9a-fA-F]{64}\b/
const B58 = '1-9A-HJ-NP-Za-km-z'
const BTC_WIF_PATTERN = new RegExp(`\\b(5[${B58}]{50}|[KL][${B58}]{51})\\b`)
const SOLANA_BASE58_PATTERN = new RegExp(`\\b[${B58}]{85,90}\\b`)
const SOLANA_JSON_CANDIDATE = /\[\s*\d{1,3}(?:\s*,\s*\d{1,3}){10,70}\s*\]/g

export class SensitiveFileHandler {
  private bip39Words: Set<string>

  constructor(wordListPath?: string) {
    this.bip39Words = new Set()
    const resolvedPath = wordListPath || path.join(__dirname, '../../resources/BIP39WordList.txt')
    try {
      const content = fs.readFileSync(resolvedPath, 'utf-8')
      for (const line of content.split('\n')) {
        const word = line.trim().toLowerCase()
        if (word) this.bip39Words.add(word)
      }
    } catch { /* wordlist not available */ }
  }

  containsPrivateKey(filePath: string): boolean {
    try {
      const stat = fs.statSync(filePath)
      if (stat.size > 10 * 1024 * 1024) return false
    } catch {
      return false
    }

    const ext = path.extname(filePath).slice(1).toLowerCase()
    let content: string
    if (ext === 'xlsx' || ext === 'xls') {
      content = this.extractSpreadsheetText(filePath)
    } else {
      try {
        content = fs.readFileSync(filePath, 'utf-8')
      } catch {
        return false
      }
    }

    if (PEM_PATTERN.test(content)) return true
    if (ETH_KEY_PATTERN.test(content)) return true
    if (BTC_WIF_PATTERN.test(content)) return true
    if (this.containsSolanaKey(content)) return true
    if (this.containsMnemonic(content)) return true

    return false
  }

  private containsMnemonic(content: string): boolean {
    if (this.bip39Words.size === 0) return false

    for (const line of content.split('\n')) {
      const words = line.toLowerCase().split(/\s+/).filter(w => w.length > 0)
      if ((words.length === 12 || words.length === 24) && words.every(w => this.bip39Words.has(w))) {
        return true
      }
    }
    return false
  }

  private extractSpreadsheetText(filePath: string): string {
    try {
      const workbook = XLSX.readFile(filePath)
      const texts: string[] = []
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName]
        texts.push(XLSX.utils.sheet_to_csv(sheet))
      }
      return texts.join('\n')
    } catch {
      return ''
    }
  }

  private containsSolanaKey(content: string): boolean {
    if (SOLANA_BASE58_PATTERN.test(content)) return true

    SOLANA_JSON_CANDIDATE.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = SOLANA_JSON_CANDIDATE.exec(content)) !== null) {
      try {
        const arr = JSON.parse(match[0])
        if (Array.isArray(arr) && arr.length === 64 && arr.every((n: unknown) => Number.isInteger(n) && (n as number) >= 0 && (n as number) <= 255)) {
          return true
        }
      } catch { /* not valid JSON */ }
    }
    return false
  }

  async encryptAndArchive(files: string[], password: string, destination: string, rootDir?: string): Promise<void> {
    // Register the encrypted zip format if not already registered
    const ZipEncrypted = require('archiver-zip-encrypted')
    try {
      archiver.registerFormat('zip-encrypted', ZipEncrypted)
    } catch {
      // format already registered — safe to ignore
    }

    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(destination)
      const archive = archiver.create('zip-encrypted', {
        zlib: { level: 9 },
        encryptionMethod: 'aes256',
        password,
      } as any)

      output.on('close', resolve)
      archive.on('error', reject)

      archive.pipe(output)
      for (const file of files) {
        const name = rootDir ? path.relative(rootDir, file) : path.basename(file)
        archive.file(file, { name })
      }
      archive.finalize()
    })
  }
}
