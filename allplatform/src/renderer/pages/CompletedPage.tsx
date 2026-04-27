import React from 'react'
import { Button } from '@fluentui/react-components'
import { useAppStore } from '../stores/appStore'
import { ICheck, IExternal } from '../components/icons'
import { formatSize } from '../components/CategoryCard'

export function CompletedPage() {
  const organizerState = useAppStore((s) => s.organizerState)
  const scanResult = useAppStore((s) => s.scanResult)
  const openInExplorer = useAppStore((s) => s.openInExplorer)
  const reset = useAppStore((s) => s.reset)

  const fileCount = organizerState?.phase === 'completed' ? organizerState.fileCount : 0
  const totalSize = organizerState?.phase === 'completed' ? organizerState.totalSize : 0
  const keyCount = scanResult
    ? Object.values(scanResult.categorizedFiles).flat().filter(f => f.containsPrivateKey).length
    : 0

  const handleOpen = () => {
    if (scanResult) openInExplorer(scanResult.sourceDirectory)
  }

  return (
    <div className="bfs-status-page">
      <div className="bfs-done-mark"><ICheck size={44} stroke={2.2}/></div>
      <div className="bfs-done-title">整理完成</div>
      <div className="bfs-done-sub">原始文件已删除，分类目录已创建。私钥金库已加密保存。</div>

      <div className="bfs-done-stats">
        <div className="bfs-done-stat">
          <div className="n">{fileCount}</div>
          <div className="l">已整理文件</div>
        </div>
        <div className="bfs-done-stat">
          <div className="n">{formatSize(totalSize)}</div>
          <div className="l">总数据量</div>
        </div>
        <div className="bfs-done-stat">
          <div className="n" style={{ color: 'var(--key-accent)' }}>{keyCount}</div>
          <div className="l">私钥已加密</div>
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
        <Button appearance="secondary" onClick={handleOpen} icon={<IExternal size={14}/>} size="large">
          打开整理结果
        </Button>
        <Button appearance="primary" onClick={reset} size="large">
          整理其他目录
        </Button>
      </div>
    </div>
  )
}
