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
import { ICheck, IAlert, IExternal, ITrash, IUndo } from '../components/icons'
import { formatSize } from '../components/CategoryCard'

export function ConfirmPage() {
  const scanResult = useAppStore((s) => s.scanResult)
  const openInExplorer = useAppStore((s) => s.openInExplorer)
  const rollbackOrganizing = useAppStore((s) => s.rollbackOrganizing)
  const confirmAndDeleteOriginals = useAppStore((s) => s.confirmAndDeleteOriginals)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  if (!scanResult) return null

  const allFiles = Object.values(scanResult.categorizedFiles).flat()
  const selectedFiles = allFiles.filter((f) => f.isSelected)
  const totalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0)
  const fileCount = selectedFiles.length

  const handleOpenFolder = () => {
    openInExplorer(scanResult.sourceDirectory)
  }

  const handleDeleteConfirmed = async () => {
    setShowDeleteDialog(false)
    await confirmAndDeleteOriginals()
  }

  return (
    <div className="bfs-status-page">
      <div className="bfs-confirm-hero">
        <div className="bfs-confirm-icon"><ICheck size={28} stroke={2.5}/></div>
        <div className="bfs-confirm-title">文件已成功复制</div>
        <div className="bfs-confirm-sub">
          {fileCount} 个文件（{formatSize(totalSize)}）已分类归档到目标目录的子文件夹中。
        </div>
        <Button appearance="subtle" onClick={handleOpenFolder} icon={<IExternal size={12}/>} size="small"
                style={{ marginTop: 12 }}>
          在文件管理器中打开
        </Button>
      </div>

      <div className="bfs-callout">
        <IAlert size={16} style={{ flexShrink: 0, marginTop: 1 }}/>
        <div>
          <b>下一步将永久删除原始文件。</b>请先打开目标文件夹核对所有文件再继续——此操作不可撤销。
        </div>
      </div>

      <div className="bfs-confirm-actions">
        <Button
          style={{ backgroundColor: 'var(--danger)', color: '#fff', border: 'none', width: '100%', justifyContent: 'center' }}
          onClick={() => setShowDeleteDialog(true)}
          icon={<ITrash size={14}/>}
          size="large"
        >
          已核对，删除原文件
        </Button>
        <Button
          appearance="secondary"
          onClick={rollbackOrganizing}
          icon={<IUndo size={14}/>}
          size="large"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          撤销整理，恢复原状
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
