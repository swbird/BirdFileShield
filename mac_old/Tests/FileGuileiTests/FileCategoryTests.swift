import Testing
@testable import FileGuilei

@Suite("FileCategory Tests")
struct FileCategoryTests {
    @Test("displayName returns Chinese name")
    func displayName() {
        #expect(FileCategory.document.displayName == "文档")
        #expect(FileCategory.pdf.displayName == "PDF")
        #expect(FileCategory.image.displayName == "图片")
        #expect(FileCategory.audioVideo.displayName == "音视频")
        #expect(FileCategory.sensitiveConfig.displayName == "敏感配置")
        #expect(FileCategory.other.displayName == "其他")
    }

    @Test("from extension maps correctly")
    func fromExtension() {
        #expect(FileCategory.from(extension: "txt") == .document)
        #expect(FileCategory.from(extension: "docx") == .document)
        #expect(FileCategory.from(extension: "pdf") == .pdf)
        #expect(FileCategory.from(extension: "xlsx") == .spreadsheet)
        #expect(FileCategory.from(extension: "pptx") == .presentation)
        #expect(FileCategory.from(extension: "png") == .image)
        #expect(FileCategory.from(extension: "jpg") == .image)
        #expect(FileCategory.from(extension: "mp4") == .audioVideo)
        #expect(FileCategory.from(extension: "mp3") == .audioVideo)
        #expect(FileCategory.from(extension: "dmg") == .installer)
        #expect(FileCategory.from(extension: "zip") == .archive)
        #expect(FileCategory.from(extension: "torrent") == .torrent)
        #expect(FileCategory.from(extension: "swift") == .code)
        #expect(FileCategory.from(extension: "psd") == .design)
        #expect(FileCategory.from(extension: "ttf") == .font)
        #expect(FileCategory.from(extension: "sqlite") == .database)
        #expect(FileCategory.from(extension: "epub") == .ebook)
        #expect(FileCategory.from(extension: "env") == .sensitiveConfig)
        #expect(FileCategory.from(extension: "yaml") == .sensitiveConfig)
        #expect(FileCategory.from(extension: "pem") == .sensitiveConfig)
    }

    @Test("unknown extension returns other")
    func unknownExtension() {
        #expect(FileCategory.from(extension: "xyz123") == .other)
        #expect(FileCategory.from(extension: "") == .other)
    }

    @Test("case insensitive matching")
    func caseInsensitive() {
        #expect(FileCategory.from(extension: "PDF") == .pdf)
        #expect(FileCategory.from(extension: "JPG") == .image)
        #expect(FileCategory.from(extension: "Docx") == .document)
    }

    @Test("all categories have icon")
    func allHaveIcons() {
        for category in FileCategory.allCases {
            #expect(!category.icon.isEmpty)
        }
    }

    @Test("categoryFolderNames are unique")
    func uniqueFolderNames() {
        let names = FileCategory.allCases.map(\.displayName)
        #expect(Set(names).count == names.count)
    }
}
