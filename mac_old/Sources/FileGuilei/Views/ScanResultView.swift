import SwiftUI

struct ScanResultView: View {
    @Bindable var viewModel: AppViewModel

    var body: some View {
        VStack(spacing: 0) {
            headerBar.padding(.horizontal, 20).padding(.vertical, 12)
            Divider()
            ScrollView {
                LazyVStack(spacing: 8) {
                    if let result = viewModel.scanResult {
                        ForEach(result.sortedCategories, id: \.0) { category, files in
                            CategoryCardView(
                                category: category,
                                files: Binding(
                                    get: { viewModel.scanResult?.categorizedFiles[category] ?? [] },
                                    set: { viewModel.scanResult?.categorizedFiles[category] = $0 }
                                ),
                                onToggle: { id in viewModel.toggleFile(category: category, fileID: id) },
                                securityEnabled: viewModel.settings.securityEnabled
                            )
                        }
                    }
                }.padding(20)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(nsColor: .windowBackgroundColor))
    }

    private var headerBar: some View {
        HStack {
            Button(action: { viewModel.reset() }) {
                Label("返回", systemImage: "chevron.left")
            }.buttonStyle(.plain)
            VStack(alignment: .leading, spacing: 2) {
                Text("扫描结果").font(.title3.bold())
                if let result = viewModel.scanResult {
                    Text("共 \(result.totalCount) 个文件，\(ByteCountFormatter.string(fromByteCount: result.totalSize, countStyle: .file))")
                        .font(.caption).foregroundStyle(.secondary)
                }
            }
            Spacer()
            Toggle("包含文件夹", isOn: $viewModel.settings.includeFolders)
                .toggleStyle(.checkbox)
            Button("重新扫描") { viewModel.scan() }
            Button("开始整理") { Task { await viewModel.startOrganizing() } }
                .buttonStyle(.borderedProminent).disabled(viewModel.scanResult?.selectedCount == 0)
        }
    }
}
