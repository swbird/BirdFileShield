import Testing
import Foundation
@testable import FileGuilei

@Suite("FileOrganizer Tests")
struct FileOrganizerTests {
    let fm = FileManager.default

    func makeTempDir() throws -> URL {
        let dir = fm.temporaryDirectory.appending(path: UUID().uuidString)
        try fm.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }

    func createFile(_ dir: URL, name: String, content: String = "test") throws -> URL {
        let file = dir.appending(path: name)
        try content.write(to: file, atomically: true, encoding: .utf8)
        return file
    }

    @Test("copies files into category folders")
    func copyFiles() async throws {
        let dir = try makeTempDir()
        defer { try? fm.removeItem(at: dir) }
        let fileURL = try createFile(dir, name: "report.txt", content: "hello")
        let scanned = ScannedFile(url: fileURL, name: "report.txt", size: 5, category: .document, modificationDate: Date())
        let scanResult = ScanResult(sourceDirectory: dir, categorizedFiles: [.document: [scanned]])
        let organizer = FileOrganizer()
        try await organizer.copyFiles(scanResult: scanResult)
        #expect(fm.fileExists(atPath: dir.appending(path: "文档/report.txt").path))
        #expect(fm.fileExists(atPath: fileURL.path))
    }

    @Test("handles duplicate filenames")
    func duplicateNames() async throws {
        let dir = try makeTempDir()
        defer { try? fm.removeItem(at: dir) }
        let file1 = try createFile(dir, name: "a.txt", content: "first")
        let docDir = dir.appending(path: "文档")
        try fm.createDirectory(at: docDir, withIntermediateDirectories: true)
        try "existing".write(to: docDir.appending(path: "a.txt"), atomically: true, encoding: .utf8)
        let scanned = ScannedFile(url: file1, name: "a.txt", size: 5, category: .document, modificationDate: Date())
        let scanResult = ScanResult(sourceDirectory: dir, categorizedFiles: [.document: [scanned]])
        let organizer = FileOrganizer()
        try await organizer.copyFiles(scanResult: scanResult)
        #expect(fm.fileExists(atPath: docDir.appending(path: "a (1).txt").path))
    }

    @Test("rollback removes copied files and empty directories")
    func rollback() async throws {
        let dir = try makeTempDir()
        defer { try? fm.removeItem(at: dir) }
        let fileURL = try createFile(dir, name: "data.csv", content: "a,b")
        let scanned = ScannedFile(url: fileURL, name: "data.csv", size: 3, category: .spreadsheet, modificationDate: Date())
        let scanResult = ScanResult(sourceDirectory: dir, categorizedFiles: [.spreadsheet: [scanned]])
        let organizer = FileOrganizer()
        try await organizer.copyFiles(scanResult: scanResult)
        #expect(fm.fileExists(atPath: dir.appending(path: "表格/data.csv").path))
        try await organizer.rollback()
        #expect(!fm.fileExists(atPath: dir.appending(path: "表格").path))
        #expect(fm.fileExists(atPath: fileURL.path))
    }

    @Test("deleteOriginals removes source files")
    func deleteOriginals() async throws {
        let dir = try makeTempDir()
        defer { try? fm.removeItem(at: dir) }
        let fileURL = try createFile(dir, name: "photo.png", content: "img")
        let scanned = ScannedFile(url: fileURL, name: "photo.png", size: 3, category: .image, modificationDate: Date())
        let scanResult = ScanResult(sourceDirectory: dir, categorizedFiles: [.image: [scanned]])
        let organizer = FileOrganizer()
        try await organizer.copyFiles(scanResult: scanResult)
        try await organizer.deleteOriginals(scanResult: scanResult)
        #expect(!fm.fileExists(atPath: fileURL.path))
        #expect(fm.fileExists(atPath: dir.appending(path: "图片/photo.png").path))
    }

    @Test("skips unselected files")
    func skipsUnselected() async throws {
        let dir = try makeTempDir()
        defer { try? fm.removeItem(at: dir) }
        let f1 = try createFile(dir, name: "a.txt", content: "yes")
        let f2 = try createFile(dir, name: "b.txt", content: "no")
        var s1 = ScannedFile(url: f1, name: "a.txt", size: 3, category: .document, modificationDate: Date())
        var s2 = ScannedFile(url: f2, name: "b.txt", size: 2, category: .document, modificationDate: Date())
        s1.isSelected = true
        s2.isSelected = false
        let scanResult = ScanResult(sourceDirectory: dir, categorizedFiles: [.document: [s1, s2]])
        let organizer = FileOrganizer()
        try await organizer.copyFiles(scanResult: scanResult)
        #expect(fm.fileExists(atPath: dir.appending(path: "文档/a.txt").path))
        #expect(!fm.fileExists(atPath: dir.appending(path: "文档/b.txt").path))
    }
}
