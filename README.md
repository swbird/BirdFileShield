<p align="center">
  <img src="allplatform/resources/icon.png" width="128" height="128" alt="BirdFileShield Logo">
</p>

<h1 align="center">BirdFileShield</h1>

<p align="center">
  <strong>智能文件整理 & 私钥守护工具</strong><br>
  整理文件的同时，找回遗忘在角落里的加密资产
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS-blue" alt="Platform">
  <img src="https://img.shields.io/badge/electron-33-47848F?logo=electron" alt="Electron">
  <img src="https://img.shields.io/badge/react-19-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>

---

## 为什么做这个工具？

玩链久了，散落在各处的小钱包越攒越多——私钥存在某个 txt 里，助记词夹在某张 Excel 表格中，时间一长就彻底遗忘了。里面可能还有资金，**找不到就等于丢了**。

BirdFileShield 在帮你整理杂乱文件的同时，自动扫描并识别隐藏在文件中的私钥和助记词，找出来、加密保护好。

## 核心功能

### 文件整理

- **17 种智能分类** — 文档、PDF、图片、音视频、代码、设计文件、电子书等，一键归档
- **三步安全流程** — 预览 → 复制 → 确认删除，操作全程可回滚
- **危险路径防护** — 自动拦截系统目录，symlink 检测，黑名单可自定义

### 私钥守护

- **多链私钥检测** — 支持五种格式：
  - ETH 私钥（`0x` + 64 位 hex）
  - BTC WIF 私钥（`5`/`K`/`L` 开头的 Base58）
  - Solana 私钥（Base58 字符串 & JSON 数组）
  - BIP39 助记词（12 / 24 个英文单词）
  - PEM 私钥（RSA、EC 等）
- **深度子目录扫描** — 递归扫描子目录中的文本文件，扫描深度可配置（默认 2 层）
- **Excel 表格扫描** — 解析 xlsx / xls 表格内容，检测隐藏在单元格中的私钥
- **AES-256 加密** — 敏感文件自动打包为加密 ZIP，深度扫描结果独立打包

## 快速开始

### 下载安装

前往 [Releases](https://github.com/swbird/BirdFileShield/releases) 下载：

- **Windows** — `.exe` 安装包
- **macOS** — `.dmg` 安装包

### 从源码构建

```bash
git clone https://github.com/swbird/BirdFileShield.git
cd BirdFileShield/allplatform

# 安装依赖
npm install

# 开发模式
npm run dev

# 运行测试
npm test

# 构建
npm run build
npx electron-builder --mac    # macOS
npx electron-builder --win    # Windows
```

## 使用流程

```
选择目录（拖拽 / 浏览 / 粘贴路径）
  → 自动扫描 + 17 种分类
  → 私钥检测（可选：深度扫描、Excel 扫描）
  → 预览结果，取消勾选不需要的文件
  → 开始整理 → 敏感文件加密打包
  → 在文件管理器中确认
  → 删除原文件 / 或一键撤销
```

## 项目结构

```
BirdFileShield/
├── allplatform/              # Electron 跨平台版（主力）
│   ├── src/
│   │   ├── main/             # Main 进程
│   │   │   ├── services/     # FileScanner, FileOrganizer, SensitiveFileHandler
│   │   │   └── models/       # FileCategory（17 种分类）
│   │   ├── renderer/         # React UI（Fluent Design 2）
│   │   └── shared/           # 共享类型定义
│   ├── tests/                # 40 个单元测试
│   └── resources/            # 图标 + BIP39 词表
├── mac/                      # macOS 原生 SwiftUI 版
└── promo/                    # 推广落地页
```

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | Electron 33 |
| 前端 | React 19 + TypeScript 5 |
| UI | Fluent Design 2 (`@fluentui/react-components`) |
| 状态管理 | Zustand 5 |
| 构建 | electron-vite 3 + Vite 6 |
| 打包 | electron-builder（NSIS exe + DMG） |
| 加密 | archiver-zip-encrypted（AES-256） |
| 表格解析 | xlsx（SheetJS） |
| 测试 | Vitest（40 tests） |
| CI | GitHub Actions |

## 设置项

| 设置 | 说明 | 默认值 |
|------|------|--------|
| 安全加密 | 启用后自动检测和加密敏感文件 | 关闭 |
| 深度扫描 | 递归扫描子目录中的文本文件 | 关闭 |
| 扫描深度 | 深度扫描的目录层级 | 2 层 |
| 扫描文件类型 | 私钥检测的文件后缀 | txt（可选 csv/json/md/log/xlsx/xls） |

## 安全说明

- **完全离线** — 无网络请求，无遥测，无数据上传
- **密码不存储** — 加密密码仅存在于内存中，整理完成后清除
- **本地处理** — 所有文件扫描和加密操作在本地完成，私钥永远不会离开你的电脑

## License

[MIT](LICENSE)
