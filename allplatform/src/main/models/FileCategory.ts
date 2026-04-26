import { FileCategory } from '../../shared/types'

const displayNames: Record<FileCategory, string> = {
  [FileCategory.Document]: '文档',
  [FileCategory.Pdf]: 'PDF',
  [FileCategory.Spreadsheet]: '表格',
  [FileCategory.Presentation]: '演示文稿',
  [FileCategory.Image]: '图片',
  [FileCategory.AudioVideo]: '音视频',
  [FileCategory.Installer]: '安装包',
  [FileCategory.Archive]: '压缩包',
  [FileCategory.Torrent]: '种子',
  [FileCategory.Code]: '代码',
  [FileCategory.Design]: '设计文件',
  [FileCategory.Font]: '字体',
  [FileCategory.Database]: '数据库',
  [FileCategory.Ebook]: '电子书',
  [FileCategory.SensitiveConfig]: '敏感配置',
  [FileCategory.Folder]: '文件夹',
  [FileCategory.Other]: '其他',
}

const icons: Record<FileCategory, string> = {
  [FileCategory.Document]: '📄',
  [FileCategory.Pdf]: '📕',
  [FileCategory.Spreadsheet]: '📊',
  [FileCategory.Presentation]: '📽️',
  [FileCategory.Image]: '🖼️',
  [FileCategory.AudioVideo]: '🎬',
  [FileCategory.Installer]: '💿',
  [FileCategory.Archive]: '📦',
  [FileCategory.Torrent]: '🔗',
  [FileCategory.Code]: '💻',
  [FileCategory.Design]: '🎨',
  [FileCategory.Font]: '🔤',
  [FileCategory.Database]: '🗄️',
  [FileCategory.Ebook]: '📚',
  [FileCategory.SensitiveConfig]: '🔐',
  [FileCategory.Folder]: '📁',
  [FileCategory.Other]: '❓',
}

const extensions: Record<FileCategory, string[]> = {
  [FileCategory.Document]: ['txt', 'doc', 'docx', 'rtf', 'pages'],
  [FileCategory.Pdf]: ['pdf'],
  [FileCategory.Spreadsheet]: ['xlsx', 'xls', 'csv', 'numbers'],
  [FileCategory.Presentation]: ['ppt', 'pptx', 'key'],
  [FileCategory.Image]: ['png', 'jpg', 'jpeg', 'gif', 'heic', 'webp', 'bmp', 'tiff', 'svg', 'ico'],
  [FileCategory.AudioVideo]: ['mp4', 'mp3', 'mov', 'avi', 'wav', 'flac', 'mkv', 'wmv', 'aac', 'ogg', 'm4a', 'm4v'],
  [FileCategory.Installer]: ['exe', 'msi', 'appx', 'msix', 'dmg', 'pkg', 'deb', 'AppImage'],
  [FileCategory.Archive]: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'],
  [FileCategory.Torrent]: ['torrent'],
  [FileCategory.Code]: ['py', 'js', 'ts', 'swift', 'go', 'java', 'c', 'cpp', 'h', 'json', 'xml', 'html', 'css', 'sh'],
  [FileCategory.Design]: ['psd', 'ai', 'sketch', 'fig', 'xd'],
  [FileCategory.Font]: ['ttf', 'otf', 'woff', 'woff2'],
  [FileCategory.Database]: ['db', 'sqlite', 'sql'],
  [FileCategory.Ebook]: ['epub', 'mobi', 'azw3'],
  [FileCategory.SensitiveConfig]: ['env', 'config', 'yaml', 'yml', 'ini', 'conf', 'properties', 'toml', 'pem', 'key'],
  [FileCategory.Folder]: [],
  [FileCategory.Other]: [],
}

const extensionMap: Map<string, FileCategory> = new Map()
for (const [category, exts] of Object.entries(extensions)) {
  for (const ext of exts) {
    extensionMap.set(ext.toLowerCase(), category as FileCategory)
  }
}

export function getCategoryDisplayName(category: FileCategory): string {
  return displayNames[category]
}

export function getCategoryIcon(category: FileCategory): string {
  return icons[category]
}

export function getCategoryFromExtension(ext: string): FileCategory {
  return extensionMap.get(ext.toLowerCase()) ?? FileCategory.Other
}

export function getAllCategories(): FileCategory[] {
  return Object.values(FileCategory)
}

export function getAllDisplayNames(): string[] {
  return getAllCategories().map(c => displayNames[c])
}
