import Testing
import Foundation
@testable import FileGuilei

@Suite("FileScanner Tests")
struct FileScannerTests {
    let scanner = FileScanner()
    let fm = FileManager.default

    func makeTempDir() throws -> URL {
        let dir = fm.temporaryDirectory.appending(path: UUID().uuidString)
        try fm.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }

    func createFile(_ dir: URL, name: String, content: String = "test") throws {
        let file = dir.appending(path: name)
        try content.write(to: file, atomically: true, encoding: .utf8)
    }

    @Test("scans files and categorizes by extension")
    func basicScan() throws {
        let dir = try makeTempDir()
        defer { try? fm.removeItem(at: dir) }

        try createFile(dir, name: "report.docx")
        try createFile(dir, name: "photo.png")
        try createFile(dir, name: "data.csv")
        try createFile(dir, name: "unknown.xyz")

        let result = scanner.scan(directory: dir, includeFolders: false)
        #expect(result.totalCount == 4)
        #expect(result.categorizedFiles[.document]?.count == 1)
        #expect(result.categorizedFiles[.image]?.count == 1)
        #expect(result.categorizedFiles[.spreadsheet]?.count == 1)
        #expect(result.categorizedFiles[.other]?.count == 1)
    }

    @Test("does not recurse into subdirectories")
    func noRecursion() throws {
        let dir = try makeTempDir()
        defer { try? fm.removeItem(at: dir) }

        try createFile(dir, name: "top.txt")
        let sub = dir.appending(path: "subfolder")
        try fm.createDirectory(at: sub, withIntermediateDirectories: true)
        try createFile(sub, name: "nested.txt")

        let result = scanner.scan(directory: dir, includeFolders: false)
        let docFiles = result.categorizedFiles[.document] ?? []
        #expect(docFiles.count == 1)
        #expect(docFiles[0].name == "top.txt")
    }

    @Test("includes folders when requested")
    func includeFolders() throws {
        let dir = try makeTempDir()
        defer { try? fm.removeItem(at: dir) }

        try createFile(dir, name: "file.txt")
        let sub = dir.appending(path: "myFolder")
        try fm.createDirectory(at: sub, withIntermediateDirectories: true)

        let result = scanner.scan(directory: dir, includeFolders: true)
        #expect(result.categorizedFiles[.folder]?.count == 1)
    }

    @Test("excludes folders when not requested")
    func excludeFolders() throws {
        let dir = try makeTempDir()
        defer { try? fm.removeItem(at: dir) }

        let sub = dir.appending(path: "myFolder")
        try fm.createDirectory(at: sub, withIntermediateDirectories: true)

        let result = scanner.scan(directory: dir, includeFolders: false)
        #expect(result.categorizedFiles[.folder] == nil || result.categorizedFiles[.folder]?.isEmpty == true)
    }

    @Test("skips existing category folders")
    func skipCategoryFolders() throws {
        let dir = try makeTempDir()
        defer { try? fm.removeItem(at: dir) }

        let docDir = dir.appending(path: "文档")
        try fm.createDirectory(at: docDir, withIntermediateDirectories: true)
        try createFile(docDir, name: "old.txt")
        try createFile(dir, name: "new.txt")

        let result = scanner.scan(directory: dir, includeFolders: true)
        let folders = result.categorizedFiles[.folder] ?? []
        #expect(folders.contains(where: { $0.name == "文档" }) == false)
    }

    @Test("empty directory returns empty result")
    func emptyDir() throws {
        let dir = try makeTempDir()
        defer { try? fm.removeItem(at: dir) }

        let result = scanner.scan(directory: dir, includeFolders: false)
        #expect(result.totalCount == 0)
    }

    @Test("skips hidden files")
    func skipsHiddenFiles() throws {
        let dir = try makeTempDir()
        defer { try? fm.removeItem(at: dir) }

        try createFile(dir, name: ".DS_Store")
        try createFile(dir, name: ".hidden")
        try createFile(dir, name: "visible.txt")

        let result = scanner.scan(directory: dir, includeFolders: false)
        #expect(result.totalCount == 1)
    }
}
