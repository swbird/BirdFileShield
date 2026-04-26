import React, { useState } from 'react'
import { Input, Switch } from '@fluentui/react-components'
import { useAppStore } from '../stores/appStore'

export function DirectoryPickerPage() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [inputPath, setInputPath] = useState('')

  const pickDirectory = useAppStore((s) => s.pickDirectory)
  const setDirectory = useAppStore((s) => s.setDirectory)
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const scan = useAppStore((s) => s.scan)
  const targetDirectory = useAppStore((s) => s.targetDirectory)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      const path = (file as File & { path?: string }).path
      if (path) {
        setDirectory(path)
        setInputPath(path)
      }
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputPath.trim()) {
      setDirectory(inputPath.trim())
    }
  }

  const handleBrowse = async () => {
    await pickDirectory()
  }

  const handlePastePath = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text.trim()) {
        setInputPath(text.trim())
        setDirectory(text.trim())
      }
    } catch {
      // clipboard access denied — ignore
    }
  }

  const handleScan = () => {
    scan()
  }

  return (
    <div className="picker-page">
      <div className={`drop-zone-wrapper${isDragOver ? ' drag-over' : ''}`}>
        <div
          className={`drop-zone${isDragOver ? ' drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="drop-icon">📂</div>
          <div className="drop-title">拖放文件夹到这里</div>
          <div className="drop-subtitle">支持拖拽、路径输入或浏览选择</div>
          <div className="drop-actions">
            <button className="btn-primary" onClick={handleBrowse}>浏览文件夹</button>
            <button className="btn-secondary" onClick={handlePastePath}>粘贴路径</button>
          </div>
        </div>
      </div>

      <div className="picker-row">
        <Input
          className="picker-input"
          placeholder="输入目录路径..."
          value={inputPath || targetDirectory || ''}
          onChange={(_, d) => setInputPath(d.value)}
          onKeyDown={handleInputKeyDown}
        />
      </div>

      <div className="picker-options">
        <Switch
          checked={settings.includeFolders}
          onChange={(_, d) => updateSettings({ includeFolders: d.checked })}
          label="包含文件夹"
        />
      </div>

      {(targetDirectory || inputPath) && (
        <button
          className="btn-primary"
          onClick={handleScan}
          disabled={!targetDirectory && !inputPath}
          style={{ marginTop: 8, padding: '10px 32px', fontSize: 14 }}
        >
          开始扫描
        </button>
      )}
    </div>
  )
}
