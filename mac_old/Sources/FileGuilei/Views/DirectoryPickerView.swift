import SwiftUI

struct DirectoryPickerView: View {
    @Bindable var viewModel: AppViewModel
    @State private var pathText = ""
    @State private var isDragOver = false

    var body: some View {
        VStack(spacing: 0) {
            Spacer()
            dropZone.padding(.horizontal, 40)
            pathInputRow.padding(.horizontal, 40).padding(.top, 16)
            optionsRow.padding(.horizontal, 40).padding(.top, 14)
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(nsColor: .windowBackgroundColor))
    }

    private var dropZone: some View {
        VStack(spacing: 10) {
            Image(systemName: "folder.badge.plus")
                .font(.system(size: 40))
                .foregroundStyle(.secondary)
            Text("拖拽文件夹到这里").font(.headline)
            Text("或者点击下方按钮选择").font(.caption).foregroundStyle(.secondary)
            Button("选择目录") { viewModel.pickDirectory() }
                .controlSize(.large).padding(.top, 6)
        }
        .frame(maxWidth: 420).padding(.vertical, 40).frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .strokeBorder(isDragOver ? Color.accentColor : Color.secondary.opacity(0.3),
                              style: StrokeStyle(lineWidth: 2, dash: [8, 4]))
                .background(RoundedRectangle(cornerRadius: 12)
                    .fill(isDragOver ? Color.accentColor.opacity(0.05) : Color(nsColor: .controlBackgroundColor)))
        )
        .onDrop(of: [.fileURL], isTargeted: $isDragOver) { providers in
            guard let provider = providers.first else { return false }
            _ = provider.loadObject(ofClass: URL.self) { url, _ in
                guard let url else { return }
                var isDir: ObjCBool = false
                guard FileManager.default.fileExists(atPath: url.path, isDirectory: &isDir), isDir.boolValue else { return }
                DispatchQueue.main.async { viewModel.setDirectory(url) }
            }
            return true
        }
    }

    private var pathInputRow: some View {
        HStack(spacing: 8) {
            TextField("输入路径... 例如 ~/Downloads", text: $pathText)
                .textFieldStyle(.roundedBorder).onSubmit { goToPath() }
            Button("前往") { goToPath() }
        }.frame(maxWidth: 420)
    }

    private var optionsRow: some View {
        HStack {
            Toggle("归类文件夹", isOn: $viewModel.settings.includeFolders)
                .toggleStyle(.switch).controlSize(.small)
            Spacer()
        }.frame(maxWidth: 420)
    }

    private func goToPath() {
        let expanded = NSString(string: pathText).expandingTildeInPath
        let url = URL(fileURLWithPath: expanded)
        var isDir: ObjCBool = false
        guard FileManager.default.fileExists(atPath: url.path, isDirectory: &isDir), isDir.boolValue else {
            viewModel.errorMessage = "路径不存在或不是文件夹: \(pathText)"
            viewModel.showError = true
            return
        }
        viewModel.setDirectory(url)
    }
}
