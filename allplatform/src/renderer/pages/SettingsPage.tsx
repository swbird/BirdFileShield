import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Input, Switch } from '@fluentui/react-components'
import { useAppStore } from '../stores/appStore'

const SCAN_EXT_OPTIONS = [
  { ext: 'txt', label: 'TXT', locked: true },
  { ext: 'csv', label: 'CSV', locked: false },
  { ext: 'json', label: 'JSON', locked: false },
  { ext: 'md', label: 'Markdown', locked: false },
  { ext: 'log', label: 'LOG', locked: false },
  { ext: 'xlsx', label: 'Excel (.xlsx)', locked: false },
  { ext: 'xls', label: 'Excel (.xls)', locked: false },
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

  return (
    <div className="settings-page">
      <div className="settings-section-title">危险路径管理</div>

      <div className="settings-card">
        <div className="settings-label">系统默认保护路径（只读）</div>
        <div className="path-tags">
          {defaultPaths.map((p) => (
            <span className="path-tag locked" key={p}>{p}</span>
          ))}
          {defaultPaths.length === 0 && (
            <span className="empty-hint">无默认保护路径</span>
          )}
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-label">自定义保护路径</div>
        {userPaths.length === 0 && (
          <div className="empty-hint">暂无自定义路径</div>
        )}
        {userPaths.map((p) => (
          <div className="user-path-row" key={p}>
            <span className="path-tag">{p}</span>
            <button className="remove-btn" onClick={() => handleRemovePath(p)} title="删除">✕</button>
          </div>
        ))}
        <div className="add-path-row">
          <Input
            className="add-path-input"
            placeholder="输入路径..."
            value={newPath}
            onChange={(_, d) => setNewPath(d.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddPath() }}
          />
          <Button appearance="secondary" onClick={handleAddPath}>添加</Button>
        </div>
      </div>

      <div className="settings-section-title">私钥扫描文件类型</div>

      <div className="settings-card">
        <div className="settings-label">选择需要扫描私钥内容的文件后缀</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', marginTop: 8 }}>
          {SCAN_EXT_OPTIONS.map((opt) => (
            <Checkbox
              key={opt.ext}
              label={opt.label}
              checked={settings.scanExtensions.includes(opt.ext)}
              disabled={opt.locked}
              onChange={(_, d) => {
                if (opt.locked) return
                const current = settings.scanExtensions
                const next = d.checked
                  ? [...current, opt.ext]
                  : current.filter((e) => e !== opt.ext)
                updateSettings({ scanExtensions: next })
              }}
            />
          ))}
        </div>
      </div>

      <div className="settings-section-title">安全设置</div>

      <div className="settings-card">
        <div className="setting-toggle-row">
          <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>启用安全加密</span>
          <Switch
            checked={settings.securityEnabled}
            onChange={(_, d) => updateSettings({ securityEnabled: d.checked })}
          />
        </div>
        {settings.securityEnabled && (
          <div className="security-features">
            <div>✅ 整理前检测敏感文件中的私钥</div>
            <div>✅ 对含私钥的文件进行加密处理</div>
            <div>✅ 防止意外将私钥文件复制到不安全位置</div>
          </div>
        )}
      </div>

      <div className="settings-card">
        <div className="setting-toggle-row">
          <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>深度扫描子目录</span>
          <Switch
            checked={settings.deepScanEnabled}
            onChange={(_, d) => updateSettings({ deepScanEnabled: d.checked })}
          />
        </div>
        {settings.deepScanEnabled && (
          <div className="security-features">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 13 }}>扫描深度</span>
              <Input
                type="number"
                style={{ width: 56 }}
                value={String(settings.deepScanDepth ?? 2)}
                onChange={(_, d) => {
                  const v = parseInt(d.value, 10)
                  if (!isNaN(v) && v >= 1 && v <= 20) updateSettings({ deepScanDepth: v })
                }}
              />
              <span style={{ fontSize: 12, color: '#999' }}>层（1-20）</span>
            </div>
            <div>✅ 递归扫描子目录中的文本文件</div>
            <div>✅ 检测隐藏在子目录中的私钥和助记词</div>
            <div>✅ 深度扫描结果独立打包为加密 ZIP</div>
          </div>
        )}
      </div>
    </div>
  )
}
