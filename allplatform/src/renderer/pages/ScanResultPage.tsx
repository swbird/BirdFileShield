import React from 'react'
import { Button } from '@fluentui/react-components'
import { useAppStore } from '../stores/appStore'
import { CategoryCard } from '../components/CategoryCard'
import type { FileCategory } from '../../shared/types'
import type { ScannedFile } from '../../shared/types'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function ScanResultPage() {
  const scanResult = useAppStore((s) => s.scanResult)
  const scan = useAppStore((s) => s.scan)
  const reset = useAppStore((s) => s.reset)
  const startOrganizing = useAppStore((s) => s.startOrganizing)

  if (!scanResult) return null

  const entries = Object.entries(scanResult.categorizedFiles) as [FileCategory, ScannedFile[]][]
  // Sort by file count descending
  const sorted = entries.sort((a, b) => b[1].length - a[1].length)

  const allFiles: ScannedFile[] = entries.flatMap(([, files]) => files)
  const totalCount = allFiles.length
  const totalSize = allFiles.reduce((acc, f) => acc + f.size, 0)
  const selectedCount = allFiles.filter((f) => f.isSelected).length
  const categoryCount = entries.length
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1)

  return (
    <div className="scan-result-page">
      <div className="scan-header">
        <div className="scan-header-left">
          <Button appearance="subtle" onClick={reset}>← 返回</Button>
        </div>
        <div className="scan-header-right">
          <Button appearance="secondary" onClick={scan}>重新扫描</Button>
          <Button
            appearance="primary"
            onClick={startOrganizing}
            disabled={selectedCount === 0}
          >
            开始整理
          </Button>
        </div>
      </div>

      <div className="stats-summary">
        <div className="stats-item">
          <div className="stats-number" style={{ color: '#0078d4' }}>{totalCount}</div>
          <div className="stats-label">总文件数</div>
        </div>
        <div className="stats-divider" />
        <div className="stats-item">
          <div className="stats-number" style={{ color: '#107c41' }}>{totalSizeMB}</div>
          <div className="stats-label">总大小 (MB)</div>
        </div>
        <div className="stats-divider" />
        <div className="stats-item">
          <div className="stats-number" style={{ color: '#6b4bc4' }}>{categoryCount}</div>
          <div className="stats-label">分类数量</div>
        </div>
        <div className="stats-divider" />
        <div className="stats-item">
          <div className="stats-number" style={{ color: '#e67700' }}>{selectedCount}</div>
          <div className="stats-label">已选文件</div>
        </div>
      </div>

      <div className="category-list">
        {sorted.map(([category, files]) => (
          <CategoryCard key={category} category={category} files={files} />
        ))}
      </div>
    </div>
  )
}
