import SwiftUI

struct CompletedView: View {
    @Bindable var viewModel: AppViewModel

    var body: some View {
        VStack(spacing: 16) {
            Spacer()
            Image(systemName: "party.popper.fill").font(.system(size: 48)).foregroundStyle(.orange)
            Text("整理完成！").font(.title3.bold())
            if case .completed(let count, let size) = viewModel.organizer.state {
                Text("已整理 \(count) 个文件，共 \(ByteCountFormatter.string(fromByteCount: size, countStyle: .file))")
                    .font(.callout).foregroundStyle(.secondary)
            }
            Button("整理其他目录") { viewModel.reset() }.controlSize(.large).padding(.top, 8)
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(nsColor: .windowBackgroundColor))
    }
}
