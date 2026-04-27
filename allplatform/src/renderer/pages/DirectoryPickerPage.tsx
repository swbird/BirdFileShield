import React, { useState } from 'react'
import { Input, Switch } from '@fluentui/react-components'
import { useAppStore } from '../stores/appStore'
import { IUpload, IFolder, IClipboard, ISearch, ILock, IShieldKey, IUndo } from '../components/icons'

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
      // clipboard access denied
    }
  }

  const handleScan = () => {
    scan()
  }

  const activePath = targetDirectory || inputPath
  const canScan = !!activePath

  return (
    <div className="bfs-picker">
      <div className="bfs-picker-hero">
        <h1>整理桌面，<em>顺手找回遗忘的私钥</em></h1>
        <p>17 种智能分类把杂乱目录梳理清楚，同时扫描文本与表格中残留的助记词、私钥，加密保护——一切都在本地，不联网，不上传。</p>
      </div>

      <div
        className={`bfs-dropzone${isDragOver ? ' over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="dz-icon"><IUpload size={28}/></div>
        <div className="dz-text">
          <div className="dz-title">把文件夹拖到这里</div>
          <div className="dz-sub">或粘贴路径 / 点击浏览。整理过程全程可回滚。</div>
        </div>
        <div className="dz-actions">
          <button className="btn-secondary" onClick={handleBrowse}>
            <IFolder size={14}/> 浏览
          </button>
          <button className="btn-secondary" onClick={handlePastePath}>
            <IClipboard size={14}/> 粘贴
          </button>
        </div>
      </div>

      <div className="bfs-path-row">
        <Input
          className="bfs-path-input"
          placeholder="/Users/.../messy"
          value={inputPath || targetDirectory || ''}
          onChange={(_, d) => setInputPath(d.value)}
          onKeyDown={handleInputKeyDown}
          style={{ fontFamily: 'var(--font-mono)' }}
        />
      </div>

      <div className="bfs-options-row">
        <label className="bfs-opt">
          <Switch
            checked={settings.securityEnabled}
            onChange={(_, d) => updateSettings({ securityEnabled: d.checked })}
          />
          <span>启用安全加密</span>
          <span className="bfs-chip">推荐</span>
        </label>
        <label className="bfs-opt">
          <Switch
            checked={settings.deepScanEnabled}
            onChange={(_, d) => updateSettings({ deepScanEnabled: d.checked })}
          />
          <span>深度扫描子目录</span>
        </label>
        <span className="bfs-opt bfs-opt-local">
          <ILock size={13}/> 所有处理仅在本机
        </span>
      </div>

      <div className="bfs-cta">
        <span className="bfs-hint">
          {activePath
            ? <>将扫描 <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{activePath}</span></>
            : '选择目录后开始'}
        </span>
        <button className="btn-primary btn-lg" disabled={!canScan} onClick={handleScan}>
          <ISearch size={16}/> 开始扫描
        </button>
      </div>

      <div className="bfs-feature-strip">
        <div className="bfs-feat">
          <div className="bfs-feat-icon"><IShieldKey size={16}/></div>
          <div>
            <div className="bfs-feat-title">5 种私钥格式</div>
            <div className="bfs-feat-sub">ETH · BTC WIF · Solana · BIP39 · PEM</div>
          </div>
        </div>
        <div className="bfs-feat">
          <div className="bfs-feat-icon"><ILock size={16}/></div>
          <div>
            <div className="bfs-feat-title">AES-256 加密打包</div>
            <div className="bfs-feat-sub">敏感文件单独 ZIP，密码不入盘</div>
          </div>
        </div>
        <div className="bfs-feat">
          <div className="bfs-feat-icon"><IUndo size={16}/></div>
          <div>
            <div className="bfs-feat-title">三步可回滚</div>
            <div className="bfs-feat-sub">预览 → 复制 → 确认删除</div>
          </div>
        </div>
      </div>
    </div>
  )
}
