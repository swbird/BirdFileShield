import { describe, it, expect, afterEach } from 'vitest'
import { SensitiveFileHandler } from '../../src/main/services/SensitiveFileHandler'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { v4 as uuid } from 'uuid'

function makeTempDir(): string {
  const dir = path.join(os.tmpdir(), uuid())
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

describe('SensitiveFileHandler', () => {
  const handler = new SensitiveFileHandler(path.join(__dirname, '../../resources/BIP39WordList.txt'))
  const dirs: string[] = []

  afterEach(() => {
    for (const d of dirs) fs.rmSync(d, { recursive: true, force: true })
    dirs.length = 0
  })

  it('detects PEM private key', () => {
    const dir = makeTempDir(); dirs.push(dir)
    const content = 'Some text before\n-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA0Z...\n-----END RSA PRIVATE KEY-----\nSome text after'
    const filePath = path.join(dir, 'key.txt')
    fs.writeFileSync(filePath, content, 'utf-8')
    expect(handler.containsPrivateKey(filePath)).toBe(true)
  })

  it('detects ethereum private key (0x + 64 hex chars)', () => {
    const dir = makeTempDir(); dirs.push(dir)
    const content = 'my wallet: 0x4c0883a69102937d6231471b5dbb6204fe512961708279aac3a00b2a5e1d2f71'
    const filePath = path.join(dir, 'wallet.txt')
    fs.writeFileSync(filePath, content, 'utf-8')
    expect(handler.containsPrivateKey(filePath)).toBe(true)
  })

  it('does not flag short hex strings', () => {
    const dir = makeTempDir(); dirs.push(dir)
    const content = 'address: 0x1234abcd'
    const filePath = path.join(dir, 'addr.txt')
    fs.writeFileSync(filePath, content, 'utf-8')
    expect(handler.containsPrivateKey(filePath)).toBe(false)
  })

  it('detects 12-word mnemonic', () => {
    const dir = makeTempDir(); dirs.push(dir)
    const content = 'abandon ability able about above absent absorb abstract absurd abuse access accident'
    const filePath = path.join(dir, 'seed.txt')
    fs.writeFileSync(filePath, content, 'utf-8')
    expect(handler.containsPrivateKey(filePath)).toBe(true)
  })

  it('does not flag normal text', () => {
    const dir = makeTempDir(); dirs.push(dir)
    const content = 'This is a normal document with no sensitive data.'
    const filePath = path.join(dir, 'normal.txt')
    fs.writeFileSync(filePath, content, 'utf-8')
    expect(handler.containsPrivateKey(filePath)).toBe(false)
  })

  it('detects BTC WIF private key (uncompressed)', () => {
    const dir = makeTempDir(); dirs.push(dir)
    const content = 'btc key: 5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ'
    const filePath = path.join(dir, 'btc.txt')
    fs.writeFileSync(filePath, content, 'utf-8')
    expect(handler.containsPrivateKey(filePath)).toBe(true)
  })

  it('detects BTC WIF private key (compressed)', () => {
    const dir = makeTempDir(); dirs.push(dir)
    const content = 'key: KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn'
    const filePath = path.join(dir, 'btc2.txt')
    fs.writeFileSync(filePath, content, 'utf-8')
    expect(handler.containsPrivateKey(filePath)).toBe(true)
  })

  it('detects Solana private key (JSON array of 64 bytes)', () => {
    const dir = makeTempDir(); dirs.push(dir)
    const arr = Array.from({ length: 64 }, (_, i) => i * 4 % 256)
    const content = `solana key: ${JSON.stringify(arr)}`
    const filePath = path.join(dir, 'solana.json')
    fs.writeFileSync(filePath, content, 'utf-8')
    expect(handler.containsPrivateKey(filePath)).toBe(true)
  })

  it('does not flag JSON array with wrong length', () => {
    const dir = makeTempDir(); dirs.push(dir)
    const arr = Array.from({ length: 32 }, (_, i) => i)
    const content = JSON.stringify(arr)
    const filePath = path.join(dir, 'short-array.json')
    fs.writeFileSync(filePath, content, 'utf-8')
    expect(handler.containsPrivateKey(filePath)).toBe(false)
  })

  it('detects Solana private key (Base58 string ~88 chars)', () => {
    const dir = makeTempDir(); dirs.push(dir)
    const content = '4wBqpZM9k9K4Y4GFBpvHBxbMtQJZPEKNXSKYGnRqGy5WJq2vMV5M72XNJfrePfHLFLEDqPTiCaGfqwUGDPYBZjR'
    const filePath = path.join(dir, 'solana-b58.txt')
    fs.writeFileSync(filePath, content, 'utf-8')
    expect(handler.containsPrivateKey(filePath)).toBe(true)
  })

  it('does not flag short Base58 strings', () => {
    const dir = makeTempDir(); dirs.push(dir)
    const content = 'txhash: 4wBqpZM9k9K4Y4GFBpvHBx'
    const filePath = path.join(dir, 'txhash.txt')
    fs.writeFileSync(filePath, content, 'utf-8')
    expect(handler.containsPrivateKey(filePath)).toBe(false)
  })

  it('detects private key inside xlsx spreadsheet', () => {
    const dir = makeTempDir(); dirs.push(dir)
    const XLSX = require('xlsx')
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([
      ['Name', 'Key'],
      ['My Wallet', '0x4c0883a69102937d6231471b5dbb6204fe512961708279aac3a00b2a5e1d2f71'],
    ])
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    const filePath = path.join(dir, 'wallets.xlsx')
    XLSX.writeFile(wb, filePath)
    expect(handler.containsPrivateKey(filePath)).toBe(true)
  })

  it('does not flag xlsx without private keys', () => {
    const dir = makeTempDir(); dirs.push(dir)
    const XLSX = require('xlsx')
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([
      ['Name', 'Amount'],
      ['Alice', '100'],
      ['Bob', '200'],
    ])
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    const filePath = path.join(dir, 'normal.xlsx')
    XLSX.writeFile(wb, filePath)
    expect(handler.containsPrivateKey(filePath)).toBe(false)
  })

  it('encrypts files to password-protected zip', async () => {
    const dir = makeTempDir(); dirs.push(dir)
    const f1 = path.join(dir, 'secret.env')
    fs.writeFileSync(f1, 'API_KEY=abc123', 'utf-8')
    const f2 = path.join(dir, 'config.yaml')
    fs.writeFileSync(f2, 'key: value', 'utf-8')
    const outputZip = path.join(dir, 'encrypted.zip')

    await handler.encryptAndArchive([f1, f2], 'testpass123', outputZip)
    expect(fs.existsSync(outputZip)).toBe(true)
    expect(fs.statSync(outputZip).size).toBeGreaterThan(0)
  })
})
