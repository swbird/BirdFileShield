import SwiftUI

struct OrganizeProgressView: View {
    let organizer: FileOrganizer

    var body: some View {
        VStack(spacing: 16) {
            Spacer()
            switch organizer.state {
            case .copying(let progress, let file):
                progressContent(title: "正在复制文件...", progress: progress, detail: file)
            case .deleting(let progress, let file):
                progressContent(title: "正在删除原文件...", progress: progress, detail: file)
            default:
                ProgressView().controlSize(.large)
            }
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(nsColor: .windowBackgroundColor))
    }

    private func progressContent(title: String, progress: Double, detail: String) -> some View {
        VStack(spacing: 14) {
            Text(title).font(.headline)
            ProgressView(value: progress).frame(maxWidth: 360)
            Text("\(Int(progress * 100))%").font(.callout).foregroundStyle(.secondary)
            Text(detail).font(.caption).foregroundStyle(.secondary).lineLimit(1).truncationMode(.middle)
        }
    }
}
