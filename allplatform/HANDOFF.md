# FileGuilei Windows 版 — 开发交接文档

## 项目背景

FileGuilei 是一个文件智能归类桌面工具，macOS 版已完成开发（Swift + SwiftUI）。Windows 版将使用 **C# + WinUI 3** 技术栈，实现相同功能，提供 Windows 原生体验。

## macOS 版现状（已完成）

### 技术栈
- Swift 5.10 + SwiftUI + Swift Package Manager
- macOS 14+
- 代码位于 `Sources/FileGuilei/`，测试位于 `Tests/FileGuileiTests/`
- 31 个测试全部通过
- App bundle: `build/FileGuilei.app`
- 推广页已部署: https://fileguilei.pages.dev

### 架构概览

```
Sources/FileGuilei/
├── App/           — 入口 (main.swift, AppDelegate.swift)
├── Models/        — 数据模型 (FileCategory, ScannedFile, ScanResult)
├── Services/      — 核心业务逻辑
│   ├── DangerousPathManager  — 危险路径黑名单管理
│   ├── FileScanner           — 目录扫描 + 文件分类
│   ├── FileOrganizer         — 复制/删除/回滚（操作日志）
│   └── SensitiveFileHandler  — 私钥检测 + 加密打包
├── Config/        — 设置持久化 (AppSettings)
├── ViewModels/    — 状态管理 (AppViewModel)
└── Views/         — SwiftUI 视图 (9 个文件)
```

### 核心流程

```
选择目录 → 检查安全性 → 扫描分类 → 用户预览/反选
  → 复制到分类文件夹 → 用户 Finder 确认 → 删除原文件
                                        → 或回滚撤销
```

## Windows 版需实现的功能

### 17 种文件分类（与 macOS 版完全一致）

| 分类 | 中文名 | 扩展名 |
|------|--------|--------|
| document | 文档 | txt, doc, docx, rtf, pages |
| pdf | PDF | pdf |
| spreadsheet | 表格 | xlsx, xls, csv, numbers |
| presentation | 演示文稿 | ppt, pptx, key |
| image | 图片 | png, jpg, jpeg, gif, heic, webp, bmp, tiff, svg, ico |
| audioVideo | 音视频 | mp4, mp3, mov, avi, wav, flac, mkv, wmv, aac, ogg, m4a, m4v |
| installer | 安装包 | dmg, pkg, app, exe, msi |
| archive | 压缩包 | zip, rar, 7z, tar, gz, bz2, xz |
| torrent | 种子 | torrent |
| code | 代码 | py, js, ts, swift, go, java, c, cpp, h, json, xml, html, css, sh |
| design | 设计文件 | psd, ai, sketch, fig, xd |
| font | 字体 | ttf, otf, woff, woff2 |
| database | 数据库 | db, sqlite, sql |
| ebook | 电子书 | epub, mobi, azw3 |
| sensitiveConfig | 敏感配置 | env, config, yaml, yml, ini, conf, properties, toml, pem, key |
| folder | 文件夹 | （目录类型） |
| other | 其他 | 未匹配的所有文件 |

### 危险路径黑名单（Windows 版需调整）

macOS 默认黑名单: `/`, `/System`, `/Library`, `/usr`, `/bin`, `/sbin`, `~/Library`, `~/Applications`, `.git`, `.svn`, 隐藏文件夹

**Windows 版对应调整为:**
- `C:\Windows`, `C:\Program Files`, `C:\Program Files (x86)`
- `C:\Users\<user>\AppData`
- `C:\ProgramData`
- 系统盘根目录 `C:\`
- `.git`, `.svn` 等版本控制目录
- 以 `.` 开头的隐藏文件夹
- 用户可自定义扩展

### 三步安全流程（不变）

1. **复制阶段**: 在目标目录内创建分类子文件夹，复制文件过去。同名文件自动加 `(1)` `(2)` 后缀
2. **等待确认**: 用户在资源管理器中确认文件完整（对应 macOS 的 Finder）
3. **删除原文件**: 用户确认后删除

### Rollback 机制（不变）

- 维护有序操作日志 `List<Operation>`
- 出错时反向遍历：先删已复制文件，再删空文件夹
- 只删空目录，避免误删

### 安全功能（不变）

- **敏感配置加密**: .env, .yaml 等文件加密打包为 ZIP
- **私钥检测**: PEM 格式、`0x` + 64 位十六进制、BIP39 助记词（内置 2048 词库）
- 默认关闭，用户启用后输入密码，密码不持久化
- macOS 版使用系统 `zip -P` 命令，Windows 版可使用 `System.IO.Compression` + 第三方库（如 SharpZipLib）实现加密 ZIP

## Windows 版推荐技术栈

### 框架选型
- **C# + WinUI 3** (Windows App SDK)
- **.NET 8** 或更高
- **MSIX** 打包分发
- 最低系统: Windows 10 1809+

### 项目结构建议

```
win/
├── FileGuilei.sln
├── FileGuilei/
│   ├── App.xaml / App.xaml.cs        — 入口
│   ├── MainWindow.xaml               — 主窗口
│   ├── Models/
│   │   ├── FileCategory.cs
│   │   ├── ScannedFile.cs
│   │   └── ScanResult.cs
│   ├── Services/
│   │   ├── DangerousPathManager.cs
│   │   ├── FileScanner.cs
│   │   ├── FileOrganizer.cs
│   │   └── SensitiveFileHandler.cs
│   ├── ViewModels/
│   │   └── AppViewModel.cs           — CommunityToolkit.Mvvm
│   ├── Views/
│   │   ├── DirectoryPickerPage.xaml
│   │   ├── ScanResultPage.xaml
│   │   ├── CategoryCard.xaml          — 自定义控件
│   │   ├── ProgressPage.xaml
│   │   ├── ConfirmPage.xaml
│   │   ├── CompletedPage.xaml
│   │   └── SettingsPage.xaml
│   ├── Helpers/
│   │   └── Settings.cs               — Windows.Storage.ApplicationData
│   └── Assets/
│       └── BIP39WordList.txt
├── FileGuilei.Tests/
│   ├── FileCategoryTests.cs
│   ├── DangerousPathManagerTests.cs
│   ├── FileScannerTests.cs
│   ├── FileOrganizerTests.cs
│   └── SensitiveFileHandlerTests.cs
└── README.md
```

### 关键 API 映射（Swift → C#）

| macOS (Swift) | Windows (C#) |
|---------------|-------------|
| `FileManager.default` | `System.IO.File` / `Directory` |
| `FileManager.contentsOfDirectory()` | `Directory.GetFileSystemEntries()` |
| `FileManager.copyItem()` | `File.Copy()` |
| `FileManager.removeItem()` | `File.Delete()` / `Directory.Delete()` |
| `FileManager.createDirectory()` | `Directory.CreateDirectory()` |
| `FileManager.fileExists()` | `File.Exists()` / `Directory.Exists()` |
| `URL` (文件路径) | `string` path 或 `FileInfo`/`DirectoryInfo` |
| `NSOpenPanel` | `Windows.Storage.Pickers.FolderPicker` |
| `NSWorkspace.shared.open()` | `Process.Start("explorer.exe", path)` |
| `UserDefaults` | `Windows.Storage.ApplicationData.Current.LocalSettings` |
| `@Observable` | `ObservableObject` (CommunityToolkit.Mvvm) |
| `@Bindable` | `[ObservableProperty]` 属性 |
| `Process` (调用 zip) | `System.IO.Compression.ZipFile` + SharpZipLib |
| `Bundle.module.url(forResource:)` | 嵌入资源 `Assembly.GetManifestResourceStream()` |
| `NSRegularExpression` | `System.Text.RegularExpressions.Regex` |
| `NavigationSplitView` | `NavigationView` (WinUI 3) |
| `SwiftUI Toggle` | `ToggleSwitch` (WinUI 3) |

### UI 对应关系

| macOS View | Windows Page/Control |
|------------|---------------------|
| `NavigationSplitView` | `NavigationView` with `NavigationViewItem` |
| `DirectoryPickerView` (拖拽区) | `Grid` with `DragOver`/`Drop` 事件 |
| `ScanResultView` | `Page` with `ListView` |
| `CategoryCardView` (展开卡片) | `Expander` 控件（WinUI 3 内置） |
| `OrganizeProgressView` | `ProgressBar` + `TextBlock` |
| `ConfirmView` | `ContentDialog` 或独立 Page |
| `SettingsView` | `SettingsPage` with `ToggleSwitch` |

### 推荐依赖

| 功能 | NuGet 包 |
|------|---------|
| MVVM | `CommunityToolkit.Mvvm` |
| WinUI 控件 | `CommunityToolkit.WinUI.Controls` |
| 加密 ZIP | `SharpZipLib` 或 `DotNetZip` |
| 测试 | `MSTest` 或 `xUnit` |

## 注意事项

1. **安装包分类**: macOS 版包含 `dmg`, `pkg`, `app`，Windows 版应增加 `exe`, `msi`, `appx`, `msix`，移除 `dmg`, `pkg`, `app`
2. **路径分隔符**: Windows 使用 `\`，注意路径拼接用 `Path.Combine()`
3. **隐藏文件**: Windows 使用文件属性 `FileAttributes.Hidden` 判断，不是以 `.` 开头
4. **权限**: Windows 下可能需要管理员权限访问某些目录，注意 `UnauthorizedAccessException` 处理
5. **加密**: macOS 版使用系统 `zip -P` 命令，Windows 版建议使用 SharpZipLib 的 AES 加密，安全性更高
6. **BIP39 词库**: 同一份 `BIP39WordList.txt`（2048 词），作为嵌入资源打包
7. **拖拽**: WinUI 3 的拖拽 API 与 SwiftUI 不同，使用 `DragOver` + `Drop` 事件 + `DataPackage`

## 设计文档与实施计划参考

- 设计文档: `docs/superpowers/specs/2026-04-25-fileguilei-design.md`
- 实施计划: `docs/superpowers/plans/2026-04-25-fileguilei-implementation.md`
- macOS 源码: `Sources/FileGuilei/`（可直接对照移植）
- 测试用例: `Tests/FileGuileiTests/`（测试逻辑可复用）

## Git 历史（macOS 版 15 个功能提交）

```
de1e92ba feat: project scaffold
955bea6e feat: FileCategory model — 17 categories
82b1cf8b feat: ScannedFile & ScanResult models
99df645e feat: DangerousPathManager — default blacklist
b9670cfa feat: FileScanner — directory scan
5e1cdc7e feat: FileOrganizer — copy, delete, rollback
0a97d23a feat: SensitiveFileHandler — private key detection + encrypted zip
dbff946f feat: AppSettings — UserDefaults persistence
b5ce2333 feat: AppViewModel — state management
4684d751 feat: MainView + SidebarView — app shell
e24caadd feat: DirectoryPickerView — drag-drop, file picker
2e8c7f96 feat: ScanResultView + CategoryCardView
e92e395e feat: OrganizeProgressView, ConfirmView, CompletedView
13d8bca0 feat: SettingsView — dangerous paths + security toggle
```
