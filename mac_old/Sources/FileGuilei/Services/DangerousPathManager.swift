import Foundation

@Observable
class DangerousPathManager {
    private static let systemPaths: Set<String> = [
        "/",
        "/System",
        "/Library",
        "/usr",
        "/bin",
        "/sbin",
        "/etc",
        "/var",
        "/private",
    ]

    private static let userRelativePaths: Set<String> = [
        "Library",
        "Applications",
    ]

    private static let vcsDirectoryNames: Set<String> = [
        ".git", ".svn", ".hg",
    ]

    let defaultPaths: Set<String>
    var userPaths: Set<String> {
        didSet { saveUserPaths() }
    }

    init() {
        let home = FileManager.default.homeDirectoryForCurrentUser.path
        var paths = Self.systemPaths
        for rel in Self.userRelativePaths {
            paths.insert((home as NSString).appendingPathComponent(rel))
        }
        self.defaultPaths = paths

        if let saved = UserDefaults.standard.stringArray(forKey: "dangerousUserPaths") {
            self.userPaths = Set(saved)
        } else {
            self.userPaths = []
        }
    }

    func isSafe(path: URL) -> Bool {
        var standardized = path.standardizedFileURL.path
        while standardized.count > 1 && standardized.hasSuffix("/") {
            standardized.removeLast()
        }
        let cleanPath = (standardized as NSString).standardizingPath

        if defaultPaths.contains(cleanPath) || userPaths.contains(cleanPath) {
            return false
        }

        let lastComponent = path.lastPathComponent
        if lastComponent.hasPrefix(".") {
            return false
        }

        if Self.vcsDirectoryNames.contains(lastComponent) {
            return false
        }

        return true
    }

    func addUserPath(_ path: String) {
        userPaths.insert((path as NSString).standardizingPath)
    }

    func removeUserPath(_ path: String) {
        userPaths.remove((path as NSString).standardizingPath)
    }

    private func saveUserPaths() {
        UserDefaults.standard.set(Array(userPaths), forKey: "dangerousUserPaths")
    }
}
