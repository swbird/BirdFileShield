import Foundation

class FileScanner {
    private let fm = FileManager.default
    private let categoryFolderNames: Set<String> = Set(
        FileCategory.allCases.map(\.displayName)
    )

    func scan(directory: URL, includeFolders: Bool) -> ScanResult {
        var categorized: [FileCategory: [ScannedFile]] = [:]

        guard let contents = try? fm.contentsOfDirectory(
            at: directory,
            includingPropertiesForKeys: [.fileSizeKey, .contentModificationDateKey, .isDirectoryKey],
            options: [.skipsHiddenFiles]
        ) else {
            return ScanResult(sourceDirectory: directory, categorizedFiles: [:])
        }

        for url in contents {
            let resourceValues = try? url.resourceValues(
                forKeys: [.fileSizeKey, .contentModificationDateKey, .isDirectoryKey]
            )
            let isDirectory = resourceValues?.isDirectory ?? false

            if isDirectory {
                if categoryFolderNames.contains(url.lastPathComponent) {
                    continue
                }
                if includeFolders {
                    let file = ScannedFile(
                        url: url,
                        name: url.lastPathComponent,
                        size: directorySize(url),
                        category: .folder,
                        modificationDate: resourceValues?.contentModificationDate ?? Date()
                    )
                    categorized[.folder, default: []].append(file)
                }
                continue
            }

            let ext = url.pathExtension
            let category = FileCategory.from(extension: ext)
            let size = Int64(resourceValues?.fileSize ?? 0)
            let modDate = resourceValues?.contentModificationDate ?? Date()

            let file = ScannedFile(
                url: url,
                name: url.lastPathComponent,
                size: size,
                category: category,
                modificationDate: modDate
            )
            categorized[category, default: []].append(file)
        }

        return ScanResult(sourceDirectory: directory, categorizedFiles: categorized)
    }

    private func directorySize(_ url: URL) -> Int64 {
        guard let enumerator = fm.enumerator(
            at: url,
            includingPropertiesForKeys: [.fileSizeKey],
            options: [.skipsHiddenFiles]
        ) else { return 0 }

        var total: Int64 = 0
        for case let fileURL as URL in enumerator {
            let size = (try? fileURL.resourceValues(forKeys: [.fileSizeKey]))?.fileSize ?? 0
            total += Int64(size)
        }
        return total
    }
}
