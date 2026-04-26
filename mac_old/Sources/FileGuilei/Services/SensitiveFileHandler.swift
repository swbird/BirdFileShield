import Foundation

class SensitiveFileHandler {
    private static let pemPattern = try! NSRegularExpression(
        pattern: "-----BEGIN[\\s\\S]*?PRIVATE KEY-----"
    )
    private static let ethKeyPattern = try! NSRegularExpression(
        pattern: "0x[0-9a-fA-F]{64}"
    )

    private lazy var bip39Words: Set<String> = {
        guard let url = Bundle.module.url(forResource: "BIP39WordList", withExtension: "txt"),
              let content = try? String(contentsOf: url, encoding: .utf8) else {
            return []
        }
        return Set(content.components(separatedBy: .newlines)
            .map { $0.trimmingCharacters(in: .whitespaces).lowercased() }
            .filter { !$0.isEmpty })
    }()

    func containsPrivateKey(file: URL) -> Bool {
        guard let content = try? String(contentsOf: file, encoding: .utf8) else { return false }
        let range = NSRange(content.startIndex..., in: content)
        if Self.pemPattern.firstMatch(in: content, range: range) != nil { return true }
        if Self.ethKeyPattern.firstMatch(in: content, range: range) != nil { return true }
        if containsMnemonic(content) { return true }
        return false
    }

    private func containsMnemonic(_ content: String) -> Bool {
        guard !bip39Words.isEmpty else { return false }
        for line in content.components(separatedBy: .newlines) {
            let words = line.lowercased().components(separatedBy: .whitespaces).filter { !$0.isEmpty }
            if (words.count == 12 || words.count == 24) && words.allSatisfy({ bip39Words.contains($0) }) {
                return true
            }
        }
        return false
    }

    func encryptAndArchive(files: [URL], password: String, destination: URL) throws {
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/opt/homebrew/bin/7zz")
        process.arguments = ["a", "-tzip", "-mem=AES256", "-p" + password, destination.path] + files.map(\.path)
        process.standardOutput = FileHandle.nullDevice
        process.standardError = FileHandle.nullDevice
        try process.run()
        process.waitUntilExit()
        guard process.terminationStatus == 0 else {
            throw NSError(domain: "FileGuilei", code: Int(process.terminationStatus),
                          userInfo: [NSLocalizedDescriptionKey: "Failed to create encrypted zip"])
        }
    }
}
