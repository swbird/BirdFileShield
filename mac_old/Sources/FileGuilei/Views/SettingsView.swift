import SwiftUI

struct SettingsView: View {
    @Bindable var viewModel: AppViewModel
    @State private var newPath = ""

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                dangerousPathsSection
                securitySection
            }.padding(24)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color(nsColor: .windowBackgroundColor))
    }

    private var dangerousPathsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("危险路径管理").font(.title3.bold())
            Text("以下路径受保护，不允许作为整理目标。").font(.caption).foregroundStyle(.secondary)
            GroupBox("默认黑名单") {
                VStack(alignment: .leading, spacing: 4) {
                    ForEach(Array(viewModel.dangerousPathManager.defaultPaths.sorted()), id: \.self) { path in
                        HStack {
                            Image(systemName: "lock.fill").font(.caption2).foregroundStyle(.secondary)
                            Text(path).font(.system(.callout, design: .monospaced))
                            Spacer()
                        }.padding(.vertical, 2)
                    }
                }.padding(8)
            }
            GroupBox("自定义路径") {
                VStack(alignment: .leading, spacing: 4) {
                    ForEach(Array(viewModel.dangerousPathManager.userPaths.sorted()), id: \.self) { path in
                        HStack {
                            Text(path).font(.system(.callout, design: .monospaced))
                            Spacer()
                            Button { viewModel.dangerousPathManager.removeUserPath(path) } label: {
                                Image(systemName: "minus.circle.fill").foregroundStyle(.red)
                            }.buttonStyle(.plain)
                        }.padding(.vertical, 2)
                    }
                    if viewModel.dangerousPathManager.userPaths.isEmpty {
                        Text("暂无自定义路径").font(.caption).foregroundStyle(.tertiary)
                    }
                    HStack(spacing: 8) {
                        TextField("输入路径", text: $newPath).textFieldStyle(.roundedBorder).onSubmit { addCustomPath() }
                        Button("添加") { addCustomPath() }.disabled(newPath.isEmpty)
                    }.padding(.top, 4)
                }.padding(8)
            }
        }
    }

    private var securitySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("安全功能").font(.title3.bold())
            Toggle("启用敏感文件加密", isOn: $viewModel.settings.securityEnabled).toggleStyle(.switch)
            if viewModel.settings.securityEnabled {
                VStack(alignment: .leading, spacing: 8) {
                    Text("启用后，整理时会：").font(.caption).foregroundStyle(.secondary)
                    Text("• 敏感配置文件（.env, .yaml 等）加密打包").font(.caption).foregroundStyle(.secondary)
                    Text("• 扫描文本文件内容检测私钥，含私钥文件加密打包").font(.caption).foregroundStyle(.secondary)
                    Text("• 密码在整理时输入，不会保存到磁盘").font(.caption).foregroundStyle(.secondary)
                }.padding(.leading, 4)
            }
        }
    }

    private func addCustomPath() {
        let expanded = NSString(string: newPath).expandingTildeInPath
        viewModel.dangerousPathManager.addUserPath(expanded)
        newPath = ""
    }
}
