import React from 'react'
import { Button } from '@fluentui/react-components'
import { useAppStore } from '../stores/appStore'
import { CategoryCard, formatSize } from '../components/CategoryCard'
import { KeyVaultHero } from '../components/KeyVaultHero'
import { IArrowLeft, IRefresh, IArrowRight, IFolder } from '../components/icons'
import type { FileCategory, ScannedFile } from '../../shared/types'

export function ScanResultPage() {
  const scanResult = useAppStore((s) => s.scanResult)
  const scan = useAppStore((s) => s.scan)
  const reset = useAppStore((s) => s.reset)
  const startOrganizing = useAppStore((s) => s.startOrganizing)

  if (!scanResult) return null

  const entries = Object.entries(scanResult.categorizedFiles) as [FileCategory, ScannedFile[]][]
  const sorted = entries.sort((a, b) => b[1].length - a[1].length)

  const allFiles = entries.flatMap(([, files]) => files)
  const totalCount = allFiles.length
  const totalSize = allFiles.reduce((acc, f) => acc + f.size, 0)
  const selectedCount = allFiles.filter((f) => f.isSelected).length
  const categoryCount = entries.length
  const sensitiveFiles = allFiles.filter(f => f.containsPrivateKey)
  const keyCount = sensitiveFiles.length
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(0)

  return (
    <div className="scan-result-page">
      <div className="bfs-result-toolbar">
        <div className="bfs-toolbar-left">
          <Button appearance="subtle" onClick={reset} icon={<IArrowLeft size={14}/>}>
            返回
          </Button>
          <span className="bfs-path-pill">
            <IFolder size={11}/> {scanResult.sourceDirectory}
          </span>
        </div>
        <div className="bfs-toolbar-right">
          <Button appearance="secondary" onClick={scan} icon={<IRefresh size={14}/>}>
            重新扫描
          </Button>
          <Button
            appearance="primary"
            onClick={startOrganizing}
            disabled={selectedCount === 0}
            icon={<IArrowRight size={14}/>}
            iconPosition="after"
          >
            开始整理 ({selectedCount})
          </Button>
        </div>
      </div>

      <div className="bfs-page-head">
        <h2>扫描结果</h2>
        <p>检查并取消勾选不需要整理的文件，确认后开始复制。</p>
      </div>

      <div className="stats-summary">
        <div className="stats-item">
          <div className="stats-number" style={{ color: 'var(--accent)' }}>{totalCount}</div>
          <div className="stats-label"><b>{selectedCount}</b> 已选 / {totalCount} 个文件</div>
        </div>
        <div className="stats-divider" />
        <div className="stats-item">
          <div className="stats-number">
            {totalSizeMB}<span style={{ fontSize: 14, color: 'var(--text-tertiary)', marginLeft: 4 }}>MB</span>
          </div>
          <div className="stats-label">将处理的总数据量</div>
        </div>
        <div className="stats-divider" />
        <div className="stats-item">
          <div className="stats-number" style={{ color: 'var(--key-accent)' }}>{keyCount}</div>
          <div className="stats-label">{keyCount} 个文件中发现私钥</div>
        </div>
        <div className="stats-divider" />
        <div className="stats-item">
          <div className="stats-number" style={{ color: 'var(--ok)' }}>{categoryCount}</div>
          <div className="stats-label">个分类待归档</div>
        </div>
      </div>

      {keyCount > 0 && <KeyVaultHero files={sensitiveFiles} />}

      <div className="category-list">
        {sorted.map(([category, files]) => (
          <CategoryCard key={category} category={category} files={files} />
        ))}
      </div>
    </div>
  )
}
