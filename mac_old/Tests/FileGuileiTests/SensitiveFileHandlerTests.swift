import Testing
import Foundation
@testable import FileGuilei

@Suite("SensitiveFileHandler Tests")
struct SensitiveFileHandlerTests {
    let handler = SensitiveFileHandler()
    let fm = FileManager.default

    func makeTempDir() throws -> URL {
        let dir = fm.temporaryDirectory.appending(path: UUID().uuidString)
        try fm.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }

    @Test("detects PEM private key")
    func detectsPEM() throws {
        let dir = try makeTempDir()
        defer { try? fm.removeItem(at: dir) }
        let content = "Some text before\n-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA0Z...\n-----END RSA PRIVATE KEY-----\nSome text after"
        let file = dir.appending(path: "key.txt")
        try content.write(to: file, atomically: true, encoding: .utf8)
        #expect(handler.containsPrivateKey(file: file))
    }

    @Test("detects ethereum private key (0x + 64 hex chars)")
    func detectsEthKey() throws {
        let dir = try makeTempDir()
        defer { try? fm.removeItem(at: dir) }
        let content = "my wallet: 0x4c0883a69102937d6231471b5dbb6204fe512961708279aac3a00b2a5e1d2f71"
        let file = dir.appending(path: "wallet.txt")
        try content.write(to: file, atomically: true, encoding: .utf8)
        #expect(handler.containsPrivateKey(file: file))
    }

    @Test("does not flag short hex strings")
    func noShortHex() throws {
        let dir = try makeTempDir()
        defer { try? fm.removeItem(at: dir) }
        let content = "address: 0x1234abcd"
        let file = dir.appending(path: "addr.txt")
        try content.write(to: file, atomically: true, encoding: .utf8)
        #expect(!handler.containsPrivateKey(file: file))
    }

    @Test("detects 12-word mnemonic")
    func detects12WordMnemonic() throws {
        let dir = try makeTempDir()
        defer { try? fm.removeItem(at: dir) }
        let content = "abandon ability able about above absent absorb abstract absurd abuse access accident"
        let file = dir.appending(path: "seed.txt")
        try content.write(to: file, atomically: true, encoding: .utf8)
        #expect(handler.containsPrivateKey(file: file))
    }

    @Test("does not flag normal text")
    func normalText() throws {
        let dir = try makeTempDir()
        defer { try? fm.removeItem(at: dir) }
        let content = "This is a normal document with no sensitive data."
        let file = dir.appending(path: "normal.txt")
        try content.write(to: file, atomically: true, encoding: .utf8)
        #expect(!handler.containsPrivateKey(file: file))
    }

    @Test("encrypts files to password-protected zip")
    func encryptAndArchive() throws {
        let dir = try makeTempDir()
        defer { try? fm.removeItem(at: dir) }
        let file1 = dir.appending(path: "secret.env")
        try "API_KEY=abc123".write(to: file1, atomically: true, encoding: .utf8)
        let file2 = dir.appending(path: "config.yaml")
        try "key: value".write(to: file2, atomically: true, encoding: .utf8)
        let outputZip = dir.appending(path: "encrypted.zip")
        try handler.encryptAndArchive(files: [file1, file2], password: "testpass123", destination: outputZip)
        #expect(fm.fileExists(atPath: outputZip.path))
        let size = try fm.attributesOfItem(atPath: outputZip.path)[.size] as? Int ?? 0
        #expect(size > 0)
    }
}
