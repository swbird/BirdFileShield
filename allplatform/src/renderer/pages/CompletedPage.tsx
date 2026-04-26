import React from 'react'
import { Button } from '@fluentui/react-components'
import { useAppStore } from '../stores/appStore'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function CompletedPage() {
  const organizerState = useAppStore((s) => s.organizerState)
  const reset = useAppStore((s) => s.reset)

  const fileCount = organizerState?.phase === 'completed' ? organizerState.fileCount : 0
  const totalSize = organizerState?.phase === 'completed' ? organizerState.totalSize : 0

  return (
    <div className="completed-page">
      <div className="completed-icon">🎉</div>
      <div className="completed-title">整理完成！</div>
      <div className="completed-stats">
        共处理 {fileCount} 个文件，{formatSize(totalSize)}
      </div>
      <Button appearance="primary" onClick={reset}>
        整理其他目录
      </Button>
    </div>
  )
}
