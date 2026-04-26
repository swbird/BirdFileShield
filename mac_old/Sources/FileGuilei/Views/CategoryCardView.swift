import SwiftUI

struct CategoryCardView: View {
    let category: FileCategory
    @Binding var files: [ScannedFile]
    let onToggle: (UUID) -> Void
    let securityEnabled: Bool
    @State private var isExpanded = false

    private var totalSize: Int64 { files.reduce(0) { $0 + $1.size } }

    var body: some View {
        VStack(spacing: 0) {
            headerRow
            if isExpanded { Divider(); fileList }
        }
        .background(Color(nsColor: .controlBackgroundColor))
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .shadow(color: .black.opacity(0.06), radius: 2, y: 1)
    }

    private var headerRow: some View {
        HStack(spacing: 10) {
            Image(systemName: category.icon).font(.title2).foregroundStyle(.secondary).frame(width: 28)
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 4) {
                    Text(category.displayName).font(.system(.body, weight: .semibold))
                    if category == .sensitiveConfig && securityEnabled {
                        Image(systemName: "lock.fill").font(.caption2).foregroundStyle(.orange)
                    }
                }
                Text("\(files.count) 个文件 · \(ByteCountFormatter.string(fromByteCount: totalSize, countStyle: .file))")
                    .font(.caption).foregroundStyle(.secondary)
            }
            Spacer()
            Image(systemName: isExpanded ? "chevron.down" : "chevron.right").font(.caption).foregroundStyle(.tertiary)
        }
        .padding(.horizontal, 14).padding(.vertical, 10)
        .contentShape(Rectangle())
        .onTapGesture { withAnimation(.easeInOut(duration: 0.2)) { isExpanded.toggle() } }
    }

    private var fileList: some View {
        VStack(spacing: 0) {
            ForEach(files) { file in
                fileRow(file)
                if file.id != files.last?.id { Divider().padding(.leading, 36) }
            }
        }.padding(.horizontal, 14).padding(.bottom, 6)
    }

    private func fileRow(_ file: ScannedFile) -> some View {
        HStack(spacing: 8) {
            Toggle("", isOn: Binding(get: { file.isSelected }, set: { _ in onToggle(file.id) }))
                .toggleStyle(.checkbox).labelsHidden()
            HStack(spacing: 4) {
                Text(file.name).font(.system(.callout))
                    .foregroundStyle(file.isSelected ? .primary : .secondary)
                    .strikethrough(!file.isSelected).lineLimit(1).truncationMode(.middle)
                if file.containsPrivateKey && securityEnabled {
                    Image(systemName: "exclamationmark.triangle.fill").font(.caption2).foregroundStyle(.red).help("含私钥，将加密打包")
                }
            }
            Spacer()
            Text(file.formattedSize).font(.caption).foregroundStyle(.secondary)
        }.padding(.vertical, 4)
    }
}
