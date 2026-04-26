import Testing
import Foundation
@testable import FileGuilei

@Suite("DangerousPathManager Tests")
struct DangerousPathManagerTests {
    let manager = DangerousPathManager()

    @Test("root path is dangerous")
    func rootIsDangerous() {
        #expect(!manager.isSafe(path: URL(fileURLWithPath: "/")))
    }

    @Test("system paths are dangerous")
    func systemPaths() {
        #expect(!manager.isSafe(path: URL(fileURLWithPath: "/System")))
        #expect(!manager.isSafe(path: URL(fileURLWithPath: "/Library")))
        #expect(!manager.isSafe(path: URL(fileURLWithPath: "/usr")))
        #expect(!manager.isSafe(path: URL(fileURLWithPath: "/bin")))
        #expect(!manager.isSafe(path: URL(fileURLWithPath: "/sbin")))
    }

    @Test("user Library is dangerous")
    func userLibrary() {
        let home = FileManager.default.homeDirectoryForCurrentUser
        #expect(!manager.isSafe(path: home.appending(path: "Library")))
        #expect(!manager.isSafe(path: home.appending(path: "Applications")))
    }

    @Test("hidden directories are dangerous")
    func hiddenDirs() {
        let home = FileManager.default.homeDirectoryForCurrentUser
        #expect(!manager.isSafe(path: home.appending(path: ".git")))
        #expect(!manager.isSafe(path: home.appending(path: ".svn")))
        #expect(!manager.isSafe(path: home.appending(path: ".config")))
    }

    @Test("normal directories are safe")
    func safePaths() {
        let home = FileManager.default.homeDirectoryForCurrentUser
        #expect(manager.isSafe(path: home.appending(path: "Downloads")))
        #expect(manager.isSafe(path: home.appending(path: "Desktop")))
        #expect(manager.isSafe(path: home.appending(path: "Documents")))
    }

    @Test("user can add custom dangerous paths")
    func customPaths() {
        let manager = DangerousPathManager()
        let custom = URL(fileURLWithPath: "/tmp/my-important-data")
        manager.addUserPath(custom.path)
        #expect(!manager.isSafe(path: custom))
    }

    @Test("user can remove custom paths")
    func removeCustom() {
        let manager = DangerousPathManager()
        let custom = URL(fileURLWithPath: "/tmp/my-important-data")
        manager.addUserPath(custom.path)
        manager.removeUserPath(custom.path)
        #expect(manager.isSafe(path: custom))
    }
}
