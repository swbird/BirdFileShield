import React, { useState } from 'react'
import {
  Button,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@fluentui/react-components'
import { useAppStore } from '../stores/appStore'

export function ConfirmPage() {
  const scanResult = useAppStore((s) => s.scanResult)
  const organizerState = useAppStore((s) => s.organizerState)
  const openInExplorer = useAppStore((s) => s.openInExplorer)
  const rollbackOrganizing = useAppStore((s) => s.rollbackOrganizing)
  const confirmAndDeleteOriginals = useAppStore((s) => s.confirmAndDeleteOriginals)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  if (!scanResult) return null

  // Get stats from organizerState if available (it was completed phase when copying finished)
  // Otherwise count from scanResult
  const allFiles = Object.values(scanResult.categorizedFiles).flat()
  const selectedFiles = allFiles.filter((f) => f.isSelected)
  const totalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0)
  const fileCount = selectedFiles.length

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  const handleOpenFolder = () => {
    const dir = scanResult.sourceDirectory
    openInExplorer(dir)
  }

  const handleDeleteConfirmed = async () => {
    setShowDeleteDialog(false)
    await confirmAndDeleteOriginals()
  }

  return (
    <div className="confirm-page">
      <div className="confirm-icon">✅</div>
      <div className="confirm-title">文件已复制到分类文件夹</div>
      <div className="confirm-subtitle">
        已成功复制 {fileCount} 个文件（{formatSize(totalSize)}）到目标目录的分类文件夹中。
        请先打开文件夹确认文件完整，再决定是否删除原文件。
      </div>
      <div className="confirm-subtitle" style={{ color: 'var(--warning)', marginTop: 4 }}>
        ⚠️ 删除原文件操作不可撤销，请谨慎操作。
      </div>

      <div className="confirm-actions">
        <Button appearance="primary" onClick={handleOpenFolder}>
          打开文件夹确认
        </Button>
        <Button appearance="secondary" onClick={rollbackOrganizing}>
          撤销整理
        </Button>
        <Button
          style={{ backgroundColor: 'var(--danger)', color: '#fff', border: 'none' }}
          onClick={() => setShowDeleteDialog(true)}
        >
          确认无误，删除原文件
        </Button>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={(_, data) => setShowDeleteDialog(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>确认删除原文件</DialogTitle>
            <DialogContent>
              <p>此操作将永久删除 {fileCount} 个原始文件，无法撤销。</p>
              <p style={{ marginTop: 8, color: 'var(--danger)', fontSize: 13 }}>
                请确认已在目标目录中找到所有文件后再执行此操作。
              </p>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setShowDeleteDialog(false)}>取消</Button>
              <Button
                style={{ backgroundColor: 'var(--danger)', color: '#fff', border: 'none' }}
                onClick={handleDeleteConfirmed}
              >
                确认删除
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  )
}
