import React, { useState } from 'react'
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Label,
} from '@fluentui/react-components'
import { useAppStore } from '../stores/appStore'

export function PasswordDialog() {
  const showPasswordPrompt = useAppStore((s) => s.showPasswordPrompt)
  const dismissPasswordPrompt = useAppStore((s) => s.dismissPasswordPrompt)
  const setPasswordAndOrganize = useAppStore((s) => s.setPasswordAndOrganize)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    if (!password) {
      setError('请输入密码')
      return
    }
    if (password !== confirmPassword) {
      setError('两次密码输入不一致')
      return
    }
    setError('')
    setPassword('')
    setConfirmPassword('')
    await setPasswordAndOrganize(password)
  }

  const handleCancel = () => {
    setPassword('')
    setConfirmPassword('')
    setError('')
    dismissPasswordPrompt()
  }

  return (
    <Dialog open={showPasswordPrompt} onOpenChange={(_, data) => { if (!data.open) handleCancel() }}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>设置加密密码</DialogTitle>
          <DialogContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                检测到敏感配置文件（包含私钥），请设置密码对其进行加密保护。
              </p>
              <div>
                <Label>密码</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(_, d) => setPassword(d.value)}
                  placeholder="请输入密码"
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
              <div>
                <Label>确认密码</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(_, d) => setConfirmPassword(d.value)}
                  placeholder="再次输入密码"
                  style={{ width: '100%', marginTop: 4 }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm() }}
                />
              </div>
              {error && (
                <p style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</p>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={handleCancel}>取消</Button>
            <Button appearance="primary" onClick={handleConfirm}>确认并开始整理</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
