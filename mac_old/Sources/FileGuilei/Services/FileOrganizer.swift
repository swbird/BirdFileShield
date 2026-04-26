import Foundation

@Observable
class FileOrganizer {
    enum State: Equatable {
        case idle
        case copying(progress: Double, currentFile: String)
        case waitingConfirmation
        case deleting(progress: Double, currentFile: String)
        case completed(fileCount: Int, totalSize: Int64)
        case failed(String)

        static func == (lhs: State, rhs: State) -> Bool {
            switch (lhs, rhs) {
            case (.idle, .idle): true
            case (.copying(let lp, _), .copying(let rp, _)): lp == rp
            case (.waitingConfirmation, .waitingConfirmation): true
            case (.deleting(let lp, _), .deleting(let rp, _)): lp == rp
            case (.completed, .completed): true
            case (.failed(let lm), .failed(let rm)): lm == rm
            default: false
            }
        }
    }

    enum Operation {
        case createdDirectory(URL)
        case copiedFile(source: URL, destination: URL)
    }

    var state: State = .idle
    private var operationLog: [Operation] = []
    private let fm = FileManager.default

    func copyFiles(scanResult: ScanResult) async throws {
        operationLog.removeAll()
        let selectedFiles = scanResult.categorizedFiles.flatMap { category, files in
            files.filter(\.isSelected).map { (category, $0) }
        }
        let total = selectedFiles.count
        guard total > 0 else { return }

        for (index, (category, file)) in selectedFiles.enumerated() {
            let progress = Double(index) / Double(total)
            await MainActor.run { state = .copying(progress: progress, currentFile: file.name) }

            let categoryDir = scanResult.sourceDirectory.appending(path: category.displayName)
            if !fm.fileExists(atPath: categoryDir.path) {
                try fm.createDirectory(at: categoryDir, withIntermediateDirectories: true)
                operationLog.append(.createdDirectory(categoryDir))
            }

            let destination = uniqueDestination(for: file.name, in: categoryDir)
            do {
                try fm.copyItem(at: file.url, to: destination)
                operationLog.append(.copiedFile(source: file.url, destination: destination))
            } catch {
                try await rollback()
                await MainActor.run { state = .failed(error.localizedDescription) }
                throw error
            }
        }
        await MainActor.run { state = .waitingConfirmation }
    }

    func deleteOriginals(scanResult: ScanResult) async throws {
        let selectedFiles = scanResult.categorizedFiles.values.flatMap { $0 }.filter(\.isSelected)
        let total = selectedFiles.count
        guard total > 0 else { return }
        for (index, file) in selectedFiles.enumerated() {
            let progress = Double(index) / Double(total)
            await MainActor.run { state = .deleting(progress: progress, currentFile: file.name) }
            try fm.removeItem(at: file.url)
        }
        let totalSize = selectedFiles.reduce(0) { $0 + $1.size }
        await MainActor.run { state = .completed(fileCount: total, totalSize: totalSize) }
    }

    func rollback() async throws {
        for operation in operationLog.reversed() {
            switch operation {
            case .copiedFile(_, let destination):
                try? fm.removeItem(at: destination)
            case .createdDirectory(let dir):
                let contents = try? fm.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil)
                if contents?.isEmpty == true { try? fm.removeItem(at: dir) }
            }
        }
        operationLog.removeAll()
        await MainActor.run { state = .idle }
    }

    func reset() {
        operationLog.removeAll()
        state = .idle
    }

    private func uniqueDestination(for filename: String, in directory: URL) -> URL {
        let base = (filename as NSString).deletingPathExtension
        let ext = (filename as NSString).pathExtension
        var candidate = directory.appending(path: filename)
        var counter = 1
        while fm.fileExists(atPath: candidate.path) {
            let newName = ext.isEmpty ? "\(base) (\(counter))" : "\(base) (\(counter)).\(ext)"
            candidate = directory.appending(path: newName)
            counter += 1
        }
        return candidate
    }
}
