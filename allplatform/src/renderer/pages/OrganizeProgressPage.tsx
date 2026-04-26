import React from 'react'
import { ProgressBar } from '@fluentui/react-components'
import { useAppStore } from '../stores/appStore'

export function OrganizeProgressPage() {
  const organizerState = useAppStore((s) => s.organizerState)

  if (!organizerState || (organizerState.phase !== 'copying' && organizerState.phase !== 'deleting')) {
    return null
  }

  const { phase, progress, currentFile } = organizerState
  const title = phase === 'copying' ? '正在复制文件...' : '正在删除原文件...'
  const percent = Math.round(progress * 100)

  return (
    <div className="progress-page">
      <div className="progress-title">{title}</div>
      <div className="progress-percent">{percent}%</div>
      <div className="progress-bar">
        <ProgressBar value={progress} />
      </div>
      {currentFile && (
        <div className="progress-file" title={currentFile}>
          {currentFile}
        </div>
      )}
    </div>
  )
}
