import React, { useState } from 'react'
import { Checkbox } from '@fluentui/react-components'
import type { ScannedFile } from '../../shared/types'
import { FileCategory } from '../../shared/types'
import { useAppStore } from '../stores/appStore'
import { CATEGORY_ICONS, ILock, IKey, IChevronUp, IChevronDown } from './icons'

const CATEGORY_NAME: Record<FileCategory, string> = {
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

const CATEGORY_COLOR: Record<FileCategory, string> = {
  [FileCategory.Document]: '#0078d4',
  [FileCategory.Pdf]: '#c4314b',
  [FileCategory.Spreadsheet]: '#107c41',
  [FileCategory.Presentation]: '#d83b01',
  [FileCategory.Image]: '#0078d4',
  [FileCategory.AudioVideo]: '#6b4bc4',
  [FileCategory.Installer]: '#00b4d8',
  [FileCategory.Archive]: '#e67700',
  [FileCategory.Torrent]: '#107c41',
  [FileCategory.Code]: '#6b4bc4',
  [FileCategory.Design]: '#d83b01',
  [FileCategory.Font]: '#333333',
  [FileCategory.Database]: '#0078d4',
  [FileCategory.Ebook]: '#107c41',
  [FileCategory.SensitiveConfig]: '#c4314b',
  [FileCategory.Folder]: '#e67700',
  [FileCategory.Other]: '#999999',
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

interface CategoryCardProps {
  category: FileCategory
  files: ScannedFile[]
}

export function CategoryCard({ category, files }: CategoryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const toggleFile = useAppStore((s) => s.toggleFile)
  const settings = useAppStore((s) => s.settings)

  const name = CATEGORY_NAME[category]
  const color = CATEGORY_COLOR[category]
  const CategoryIcon = CATEGORY_ICONS[category]
  const selectedCount = files.filter((f) => f.isSelected).length
  const totalSize = files.reduce((acc, f) => acc + f.size, 0)
  const hasPrivateKey = files.some((f) => f.containsPrivateKey)
  const isSensitive = category === FileCategory.SensitiveConfig
  const selectionRatio = files.length > 0 ? selectedCount / files.length : 0

  return (
    <div className={`category-card${hasPrivateKey ? ' has-key' : ''}`}>
      <div className="category-color-bar" style={{ background: color }} />
      <div className="category-content">
        <div className="category-header" onClick={() => setExpanded((v) => !v)}>
          <div className="category-info">
            <div className="category-icon-bg" style={{ background: `${color}18`, color }}>
              {CategoryIcon && <CategoryIcon size={16}/>}
            </div>
            <div>
              <div className="category-name">
                {name}
                {isSensitive && settings.securityEnabled && (
                  <span className="lock-icon" style={{ marginLeft: 6 }}><ILock size={12}/></span>
                )}
                {hasPrivateKey && (
                  <span className="private-key-icon" style={{ marginLeft: 6 }}><IKey size={12}/></span>
                )}
              </div>
              <div className="category-stats">
                {files.length} 个文件 · {formatSize(totalSize)}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              className="category-selected-badge"
              style={{ background: `${color}18`, color }}
            >
              {selectedCount}/{files.length} 已选
            </span>
            <span className="expand-icon">
              {expanded ? <IChevronUp size={14}/> : <IChevronDown size={14}/>}
            </span>
          </div>
        </div>

        <div className="category-progress">
          <div
            className="category-progress-fill"
            style={{ width: `${selectionRatio * 100}%`, background: color }}
          />
        </div>

        {expanded && (
          <div className="category-files">
            {files.map((file) => (
              <div className="file-row" key={file.id}>
                <Checkbox
                  checked={file.isSelected}
                  onChange={() => toggleFile(category, file.id)}
                />
                <span className={`file-name${file.isSelected ? '' : ' deselected'}`}>
                  {file.name}
                </span>
                {file.containsPrivateKey && (
                  <span className="private-key-icon" title="包含私钥"><IKey size={12}/></span>
                )}
                <span className="file-size">{formatSize(file.size)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
