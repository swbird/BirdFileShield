import SwiftUI

struct MainView: View {
    @State private var viewModel = AppViewModel()

    var body: some View {
        NavigationSplitView {
            SidebarView(selectedPage: $viewModel.selectedPage)
                .navigationSplitViewColumnWidth(min: 160, ideal: 180, max: 220)
        } detail: {
            switch viewModel.selectedPage {
            case .organize:
                organizeDetailView
            case .settings:
                SettingsView(viewModel: viewModel)
            }
        }
        .frame(minWidth: 700, minHeight: 480)
        .alert("错误", isPresented: $viewModel.showError) {
            Button("确定") {}
        } message: {
            Text(viewModel.errorMessage ?? "未知错误")
        }
        .sheet(isPresented: $viewModel.showPasswordPrompt) {
            PasswordPromptView(
                password: $viewModel.securityPassword,
                onConfirm: {
                    viewModel.showPasswordPrompt = false
                    Task { await viewModel.startOrganizing() }
                },
                onCancel: { viewModel.showPasswordPrompt = false }
            )
        }
    }

    @ViewBuilder
    private var organizeDetailView: some View {
        switch viewModel.appState {
        case .idle:
            DirectoryPickerView(viewModel: viewModel)
        case .scanned:
            ScanResultView(viewModel: viewModel)
        case .organizing:
            OrganizeProgressView(organizer: viewModel.organizer)
        case .waitingConfirmation:
            ConfirmView(viewModel: viewModel)
        case .completed:
            CompletedView(viewModel: viewModel)
        }
    }
}

struct PasswordPromptView: View {
    @Binding var password: String
    @State private var confirmPassword = ""
    var onConfirm: () -> Void
    var onCancel: () -> Void

    private var passwordsMatch: Bool {
        !password.isEmpty && password == confirmPassword
    }

    var body: some View {
        VStack(spacing: 16) {
            Text("输入加密密码")
                .font(.headline)
            Text("敏感配置文件和含私钥文件将使用此密码加密打包。")
                .font(.caption)
                .foregroundStyle(.secondary)
            SecureField("密码", text: $password)
                .textFieldStyle(.roundedBorder)
            SecureField("确认密码", text: $confirmPassword)
                .textFieldStyle(.roundedBorder)
            if !password.isEmpty && !confirmPassword.isEmpty && !passwordsMatch {
                Text("两次密码不一致")
                    .font(.caption)
                    .foregroundStyle(.red)
            }
            HStack {
                Button("取消", action: onCancel)
                    .keyboardShortcut(.cancelAction)
                Button("确定", action: onConfirm)
                    .keyboardShortcut(.defaultAction)
                    .disabled(!passwordsMatch)
            }
        }
        .padding(24)
        .frame(width: 320)
    }
}
