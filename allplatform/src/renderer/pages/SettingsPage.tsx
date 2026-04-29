import React, { useEffect, useState } from 'react'
import { Button, Input, Switch } from '@fluentui/react-components'
import { useAppStore } from '../stores/appStore'
import { ICheck, ILock, IX, IPlus } from '../components/icons'

const SCAN_EXT_OPTIONS = [
  { ext: 'txt', locked: true },
  { ext: 'csv', locked: false },
  { ext: 'json', locked: false },
  { ext: 'md', locked: false },
  { ext: 'log', locked: false },
  { ext: 'xlsx', locked: false },
  { ext: 'xls', locked: false },
  { ext: 'yaml', locked: false },
]

export function SettingsPage() {
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const loadSettings = useAppStore((s) => s.loadSettings)

  const [defaultPaths, setDefaultPaths] = useState<string[]>([])
  const [userPaths, setUserPaths] = useState<string[]>([])
  const [newPath, setNewPath] = useState('')

  useEffect(() => {
    loadSettings()
    loadPaths()
  }, [])

  const loadPaths = async () => {
    try {
      const result = await window.api.getDangerousPaths()
      setDefaultPaths(result.defaultPaths)
      setUserPaths(result.userPaths)
    } catch {
      // ignore
    }
  }

  const handleAddPath = async () => {
    const path = newPath.trim()
    if (!path) return
    try {
      await window.api.addDangerousPath(path)
      setNewPath('')
      await loadPaths()
    } catch {
      // ignore
    }
  }

  const handleRemovePath = async (path: string) => {
    try {
      await window.api.removeDangerousPath(path)
      await loadPaths()
    } catch {
      // ignore
    }
  }

  const toggleExt = (ext: string) => {
    const current = settings.scanExtensions
    const next = current.includes(ext)
      ? current.filter((e) => e !== ext)
      : [...current, ext]
    updateSettings({ scanExtensions: next })
  }

  return (
    <div className="settings-page">
      <div className="bfs-page-head">
        <h2>设置</h2>
        <p>调整扫描范围、安全策略与受保护的路径。</p>
      </div>

      <div className="bfs-settings-group">
        <div className="bfs-settings-group-title">安全策略</div>
        <div className="settings-card">
          <div className="bfs-settings-row">
            <div className="bfs-settings-text">
              <div className="bfs-settings-t">启用安全加密</div>
              <div className="bfs-settings-d">检测到私钥时，自动打包为 AES-256 加密 ZIP，密码仅在内存中保留。</div>
            </div>
            <Switch
              checked={settings.securityEnabled}
              onChange={(_, d) => updateSettings({ securityEnabled: d.checked })}
            />
          </div>
          <div className="bfs-settings-row">
            <div className="bfs-settings-text">
              <div className="bfs-settings-t">深度扫描私钥</div>
              <div className="bfs-settings-d">递归扫描子目录中的文本文件，检测遗留的私钥与助记词，发现的敏感文件独立加密打包。</div>
            </div>
            <Switch
              checked={settings.deepScanEnabled}
              onChange={(_, d) => updateSettings({ deepScanEnabled: d.checked })}
            />
          </div>
          {settings.deepScanEnabled && (
            <div className="bfs-depth-row">
              <span>最大深度</span>
              <Input
                type="number"
                style={{ width: 64 }}
                value={String(settings.deepScanDepth ?? 2)}
                onChange={(_, d) => {
                  const v = parseInt(d.value, 10)
                  if (!isNaN(v) && v >= 1 && v <= 20) updateSettings({ deepScanDepth: v })
                }}
              />
              <span style={{ color: 'var(--text-tertiary)' }}>层（1-20）</span>
            </div>
          )}
        </div>
      </div>

      <div className="bfs-settings-group">
        <div className="bfs-settings-group-title">私钥扫描文件类型</div>
        <div className="settings-card">
          <div style={{ padding: '14px 16px 0', fontSize: 12, color: 'var(--text-secondary)' }}>
            选择需要逐字检查私钥内容的文件后缀
          </div>
          <div className="bfs-ext-grid">
            {SCAN_EXT_OPTIONS.map(o => {
              const checked = settings.scanExtensions.includes(o.ext)
              return (
                <div
                  key={o.ext}
                  className={`bfs-ext-item${checked ? ' checked' : ''}${o.locked ? ' locked' : ''}`}
                  onClick={() => !o.locked && toggleExt(o.ext)}
                >
                  <span className={`bfs-cbx${checked ? ' checked' : ''}`}>
                    {checked && <ICheck size={10} stroke={2.5}/>}
                  </span>
                  <span>.{o.ext}</span>
                  {o.locked && <ILock size={10} style={{ marginLeft: 'auto', opacity: 0.5 }}/>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bfs-settings-group">
        <div className="bfs-settings-group-title">受保护路径</div>
        <div className="settings-card">
          <div className="bfs-settings-row" style={{ borderBottom: '1px dashed var(--border)' }}>
            <div className="bfs-settings-text">
              <div className="bfs-settings-t">系统默认</div>
              <div className="bfs-settings-d">拒绝扫描的关键路径，由 BirdFileShield 内置维护。</div>
            </div>
          </div>
          <div className="bfs-path-list">
            {defaultPaths.map(p => (
              <span className="path-tag locked" key={p}><ILock size={10}/>{p}</span>
            ))}
            {defaultPaths.length === 0 && (
              <span className="empty-hint">无默认保护路径</span>
            )}
          </div>
          <div className="bfs-settings-row" style={{ borderBottom: '1px dashed var(--border)' }}>
            <div className="bfs-settings-text">
              <div className="bfs-settings-t">自定义</div>
              <div className="bfs-settings-d">回车添加。这些路径下的文件将不会被扫描或整理。</div>
            </div>
          </div>
          <div className="bfs-path-list">
            {userPaths.length === 0 && (
              <span className="empty-hint">暂无自定义路径</span>
            )}
            {userPaths.map(p => (
              <span className="path-tag" key={p}>
                {p}
                <span className="bfs-path-x" onClick={() => handleRemovePath(p)}><IX size={11}/></span>
              </span>
            ))}
          </div>
          <div style={{ padding: '0 16px 14px', display: 'flex', gap: 8 }}>
            <Input
              style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
              placeholder="~/path/to/protect"
              value={newPath}
              onChange={(_, d) => setNewPath(d.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddPath() }}
            />
            <Button appearance="secondary" onClick={handleAddPath} icon={<IPlus size={14}/>}>
              添加
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
