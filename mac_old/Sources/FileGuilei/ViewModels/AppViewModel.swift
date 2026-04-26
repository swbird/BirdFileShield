import Foundation
import AppKit

@Observable
class AppViewModel {
    enum SidebarPage: String, CaseIterable, Identifiable {
        case organize
        case settings
        var id: String { rawValue }
        var label: String {
            switch self {
            case .organize: "整理"
            case .settings: "设置"
            }
        }
        var icon: String {
            switch self {
            case .organize: "folder"
            case .settings: "gearshape"
            }
        }
    }

    enum AppState: Equatable {
        case idle
        case scanned
        case organizing
        case waitingConfirmation
        case completed
    }

    var selectedPage: SidebarPage = .organize
    var targetDirectory: URL?
    var scanResult: ScanResult?
    var appState: AppState = .idle
    var securityPassword: String = ""
    var showPasswordPrompt: Bool = false
    var errorMessage: String?
    var showError: Bool = false

    var settings = AppSettings()
    var dangerousPathManager = DangerousPathManager()
    let scanner = FileScanner()
    let organizer = FileOrganizer()
    let sensitiveHandler = SensitiveFileHandler()

    func pickDirectory() {
        let panel = NSOpenPanel()
        panel.canChooseFiles = false
        panel.canChooseDirectories = true
        panel.allowsMultipleSelection = false
        panel.message = "选择要整理的目录"
        panel.prompt = "选择"
        guard panel.runModal() == .OK, let url = panel.url else { return }
        setDirectory(url)
    }

    func setDirectory(_ url: URL) {
        guard dangerousPathManager.isSafe(path: url) else {
            errorMessage = "\"\(url.path)\" 是受保护的系统路径，无法整理。"
            showError = true
            return
        }
        targetDirectory = url
        scan()
    }

    func scan() {
        guard let dir = targetDirectory else { return }
        let result = scanner.scan(directory: dir, includeFolders: settings.includeFolders)
        if settings.securityEnabled {
            var updated = result.categorizedFiles
            if let docs = updated[.document] {
                var newDocs: [ScannedFile] = []
                for var file in docs {
                    if sensitiveHandler.containsPrivateKey(file: file.url) {
                        file.containsPrivateKey = true
                    }
                    newDocs.append(file)
                }
                updated[.document] = newDocs
            }
            scanResult = ScanResult(sourceDirectory: dir, categorizedFiles: updated)
        } else {
            scanResult = result
        }
        appState = .scanned
    }

    func toggleFile(category: FileCategory, fileID: UUID) {
        guard var files = scanResult?.categorizedFiles[category],
              let index = files.firstIndex(where: { $0.id == fileID }) else { return }
        files[index].isSelected.toggle()
        scanResult?.categorizedFiles[category] = files
    }

    private var hasSensitiveFiles: Bool {
        guard let scanResult else { return false }
        let sensitiveSelected = scanResult.categorizedFiles[.sensitiveConfig]?.contains(where: \.isSelected) ?? false
        let privateKeySelected = scanResult.categorizedFiles[.document]?.contains(where: { $0.isSelected && $0.containsPrivateKey }) ?? false
        return sensitiveSelected || privateKeySelected
    }

    func startOrganizing() async {
        guard let scanResult else { return }
        if settings.securityEnabled && securityPassword.isEmpty && hasSensitiveFiles {
            await MainActor.run { showPasswordPrompt = true }
            return
        }
        await MainActor.run { appState = .organizing }
        do {
            try await organizer.copyFiles(scanResult: scanResult)
            if settings.securityEnabled {
                try await handleSensitiveFiles(scanResult: scanResult)
            }
            await MainActor.run { appState = .waitingConfirmation }
        } catch {
            await MainActor.run {
                errorMessage = "整理失败: \(error.localizedDescription)"
                showError = true
                appState = .scanned
            }
        }
    }

    func confirmAndDeleteOriginals() async {
        guard let scanResult else { return }
        do {
            try await organizer.deleteOriginals(scanResult: scanResult)
            await MainActor.run { appState = .completed }
        } catch {
            await MainActor.run {
                errorMessage = "删除原文件失败: \(error.localizedDescription)"
                showError = true
            }
        }
    }

    func rollbackOrganizing() async {
        try? await organizer.rollback()
        await MainActor.run { appState = .scanned }
    }

    func reset() {
        targetDirectory = nil
        scanResult = nil
        securityPassword = ""
        organizer.reset()
        appState = .idle
    }

    func openInFinder() {
        guard let dir = targetDirectory else { return }
        NSWorkspace.shared.open(dir)
    }

    private func handleSensitiveFiles(scanResult: ScanResult) async throws {
        let sensitiveFiles = scanResult.categorizedFiles[.sensitiveConfig]?.filter(\.isSelected) ?? []
        if !sensitiveFiles.isEmpty {
            let destDir = scanResult.sourceDirectory.appending(path: FileCategory.sensitiveConfig.displayName)
            let zipPath = destDir.appending(path: "敏感配置.zip")
            try sensitiveHandler.encryptAndArchive(files: sensitiveFiles.map(\.url), password: securityPassword, destination: zipPath)
            for file in sensitiveFiles {
                let copied = destDir.appending(path: file.name)
                try? FileManager.default.removeItem(at: copied)
            }
        }
        let privateKeyFiles = scanResult.categorizedFiles[.document]?.filter { $0.isSelected && $0.containsPrivateKey } ?? []
        if !privateKeyFiles.isEmpty {
            let destDir = scanResult.sourceDirectory.appending(path: "含私钥文件")
            try FileManager.default.createDirectory(at: destDir, withIntermediateDirectories: true)
            let zipPath = destDir.appending(path: "含私钥文件.zip")
            try sensitiveHandler.encryptAndArchive(files: privateKeyFiles.map(\.url), password: securityPassword, destination: zipPath)
            let docDir = scanResult.sourceDirectory.appending(path: FileCategory.document.displayName)
            for file in privateKeyFiles {
                let copied = docDir.appending(path: file.name)
                try? FileManager.default.removeItem(at: copied)
            }
        }
    }
}
