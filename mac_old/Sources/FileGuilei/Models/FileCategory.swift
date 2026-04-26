import Foundation

enum FileCategory: String, CaseIterable, Identifiable, Hashable {
    case document
    case pdf
    case spreadsheet
    case presentation
    case image
    case audioVideo
    case installer
    case archive
    case torrent
    case code
    case design
    case font
    case database
    case ebook
    case sensitiveConfig
    case folder
    case other

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .document: "文档"
        case .pdf: "PDF"
        case .spreadsheet: "表格"
        case .presentation: "演示文稿"
        case .image: "图片"
        case .audioVideo: "音视频"
        case .installer: "安装包"
        case .archive: "压缩包"
        case .torrent: "种子"
        case .code: "代码"
        case .design: "设计文件"
        case .font: "字体"
        case .database: "数据库"
        case .ebook: "电子书"
        case .sensitiveConfig: "敏感配置"
        case .folder: "文件夹"
        case .other: "其他"
        }
    }

    var icon: String {
        switch self {
        case .document: "doc.text"
        case .pdf: "doc.richtext"
        case .spreadsheet: "tablecells"
        case .presentation: "play.rectangle"
        case .image: "photo"
        case .audioVideo: "film"
        case .installer: "arrow.down.app"
        case .archive: "archivebox"
        case .torrent: "arrow.triangle.2.circlepath"
        case .code: "chevron.left.forwardslash.chevron.right"
        case .design: "paintbrush"
        case .font: "textformat"
        case .database: "cylinder"
        case .ebook: "book"
        case .sensitiveConfig: "lock.shield"
        case .folder: "folder"
        case .other: "questionmark.folder"
        }
    }

    var extensions: Set<String> {
        switch self {
        case .document: ["txt", "doc", "docx", "rtf", "pages"]
        case .pdf: ["pdf"]
        case .spreadsheet: ["xlsx", "xls", "csv", "numbers"]
        case .presentation: ["ppt", "pptx", "key"]
        case .image: ["png", "jpg", "jpeg", "gif", "heic", "webp", "bmp", "tiff", "svg", "ico"]
        case .audioVideo: ["mp4", "mp3", "mov", "avi", "wav", "flac", "mkv", "wmv", "aac", "ogg", "m4a", "m4v"]
        case .installer: ["dmg", "pkg", "app", "exe", "msi"]
        case .archive: ["zip", "rar", "7z", "tar", "gz", "bz2", "xz"]
        case .torrent: ["torrent"]
        case .code: ["py", "js", "ts", "swift", "go", "java", "c", "cpp", "h", "json", "xml", "html", "css", "sh"]
        case .design: ["psd", "ai", "sketch", "fig", "xd"]
        case .font: ["ttf", "otf", "woff", "woff2"]
        case .database: ["db", "sqlite", "sql"]
        case .ebook: ["epub", "mobi", "azw3"]
        case .sensitiveConfig: ["env", "config", "yaml", "yml", "ini", "conf", "properties", "toml", "pem", "key"]
        case .folder: []
        case .other: []
        }
    }

    private static let extensionMap: [String: FileCategory] = {
        var map: [String: FileCategory] = [:]
        for category in FileCategory.allCases {
            for ext in category.extensions {
                map[ext] = category
            }
        }
        return map
    }()

    static func from(extension ext: String) -> FileCategory {
        extensionMap[ext.lowercased()] ?? .other
    }
}
