import React from 'react'
import type { ScannedFile } from '../../shared/types'
import { IShieldKey, IKey, IDot } from './icons'
import { formatSize } from './CategoryCard'

const CATEGORY_LABEL: Record<string, string> = {
  document: '文档', pdf: 'PDF', spreadsheet: '表格', presentation: '演示文稿',
  image: '图片', audioVideo: '音视频', installer: '安装包', archive: '压缩包',
  torrent: '种子', code: '代码', design: '设计文件', font: '字体',
  database: '数据库', ebook: '电子书', sensitiveConfig: '敏感配置',
  folder: '文件夹', other: '其他',
}

interface KeyVaultHeroProps {
  files: ScannedFile[]
}

export function KeyVaultHero({ files }: KeyVaultHeroProps) {
  if (files.length === 0) return null

  return (
    <div className="bfs-vault-hero">
      <div className="bfs-vault-head">
        <div className="bfs-vault-icon"><IShieldKey size={22}/></div>
        <div style={{ flex: 1 }}>
          <div className="bfs-vault-title">私钥金库 · 发现 {files.length} 处敏感内容</div>
          <div className="bfs-vault-sub">这些将被独立打包为 AES-256 加密 ZIP，原始文件保持原位。</div>
        </div>
        <span className="bfs-vault-count">{files.length}</span>
      </div>
      <div className="bfs-findings">
        {files.slice(0, 4).map(f => (
          <div className="bfs-finding" key={f.id}>
            <IKey size={14} style={{ color: 'var(--key-accent)', flexShrink: 0 }}/>
            <div className="bfs-finding-main">
              <div className="bfs-finding-file">{f.name}</div>
              <div className="bfs-finding-meta">
                <span>{CATEGORY_LABEL[f.category] || f.category}</span>
                <IDot size={3} color="var(--text-tertiary)"/>
                <span>{formatSize(f.size)}</span>
              </div>
            </div>
            <div className="bfs-finding-preview">已检测到敏感内容</div>
          </div>
        ))}
        {files.length > 4 && (
          <div className="bfs-finding-more">
            还有 {files.length - 4} 个含私钥文件
          </div>
        )}
      </div>
    </div>
  )
}
