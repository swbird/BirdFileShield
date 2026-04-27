import React from 'react'
import { ProgressBar } from '@fluentui/react-components'
import { useAppStore } from '../stores/appStore'
import { IFolder } from '../components/icons'

export function OrganizeProgressPage() {
  const organizerState = useAppStore((s) => s.organizerState)

  if (!organizerState || (organizerState.phase !== 'copying' && organizerState.phase !== 'deleting')) {
    return null
  }

  const { phase, progress, currentFile } = organizerState
  const title = phase === 'copying' ? '正在复制文件…' : '正在删除原文件…'
  const percent = Math.round(progress * 100)

  return (
    <div className="bfs-status-page">
      <div className="bfs-orb"><IFolder size={36}/></div>
      <div className="bfs-status-title">{title}</div>
      {currentFile && (
        <div className="bfs-status-sub" title={currentFile}>{currentFile}</div>
      )}
      <div style={{ width: '100%', maxWidth: 380, marginTop: 30 }}>
        <ProgressBar value={progress} />
        <div className="bfs-percent">{percent}%</div>
      </div>
    </div>
  )
}
