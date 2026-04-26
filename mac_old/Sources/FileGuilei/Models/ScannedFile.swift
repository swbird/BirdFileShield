import Foundation

struct ScannedFile: Identifiable, Hashable {
    let id = UUID()
    let url: URL
    let name: String
    let size: Int64
    let category: FileCategory
    let modificationDate: Date
    var isSelected: Bool = true
    var containsPrivateKey: Bool = false

    static func == (lhs: ScannedFile, rhs: ScannedFile) -> Bool {
        lhs.id == rhs.id
    }

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }

    var formattedSize: String {
        ByteCountFormatter.string(fromByteCount: size, countStyle: .file)
    }
}

struct ScanResult {
    let sourceDirectory: URL
    var categorizedFiles: [FileCategory: [ScannedFile]]

    var totalCount: Int {
        categorizedFiles.values.reduce(0) { $0 + $1.count }
    }

    var totalSize: Int64 {
        categorizedFiles.values.flatMap { $0 }.reduce(0) { $0 + $1.size }
    }

    var selectedCount: Int {
        categorizedFiles.values.flatMap { $0 }.filter(\.isSelected).count
    }

    var selectedSize: Int64 {
        categorizedFiles.values.flatMap { $0 }.filter(\.isSelected).reduce(0) { $0 + $1.size }
    }

    var sortedCategories: [(FileCategory, [ScannedFile])] {
        categorizedFiles
            .filter { !$1.isEmpty }
            .sorted { $0.value.count > $1.value.count }
    }
}
