import SwiftUI

struct ConfirmView: View {
    @Bindable var viewModel: AppViewModel
    @State private var showDeleteAlert = false

    var body: some View {
        VStack(spacing: 16) {
            Spacer()
            Image(systemName: "checkmark.circle.fill").font(.system(size: 48)).foregroundStyle(.green)
            Text("文件已复制到分类文件夹").font(.title3.bold())
            if let result = viewModel.scanResult {
                Text("共整理 \(result.selectedCount) 个文件（\(ByteCountFormatter.string(fromByteCount: result.selectedSize, countStyle: .file))）")
                    .font(.callout).foregroundStyle(.secondary)
            }
            Text("请前往目标目录确认文件完整无误后，再删除原文件。")
                .font(.caption).foregroundStyle(.secondary).multilineTextAlignment(.center).frame(maxWidth: 340)
            HStack(spacing: 12) {
                Button("在 Finder 中查看") { viewModel.openInFinder() }
                Button("撤销整理") { Task { await viewModel.rollbackOrganizing() } }
            }.padding(.top, 4)
            Button("确认无误，删除原文件") { showDeleteAlert = true }
                .buttonStyle(.borderedProminent).tint(.red).padding(.top, 4)
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(nsColor: .windowBackgroundColor))
        .alert("确认删除", isPresented: $showDeleteAlert) {
            Button("取消", role: .cancel) {}
            Button("删除原文件", role: .destructive) { Task { await viewModel.confirmAndDeleteOriginals() } }
        } message: { Text("删除后无法恢复。请确认分类文件夹中的文件完整无误。") }
    }
}
