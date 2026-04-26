import React, { useEffect } from 'react'
import { FluentProvider, webLightTheme, Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions, Button } from '@fluentui/react-components'
import { useAppStore } from './stores/appStore'
import { Sidebar } from './components/Sidebar'
import { Titlebar } from './components/Titlebar'
import { PasswordDialog } from './components/PasswordDialog'
import { DirectoryPickerPage } from './pages/DirectoryPickerPage'
import { ScanResultPage } from './pages/ScanResultPage'
import { OrganizeProgressPage } from './pages/OrganizeProgressPage'
import { ConfirmPage } from './pages/ConfirmPage'
import { CompletedPage } from './pages/CompletedPage'
import { SettingsPage } from './pages/SettingsPage'
import './styles/fluent.css'

function OrganizePage() {
  const appState = useAppStore((s) => s.appState)

  switch (appState) {
    case 'idle':
      return <DirectoryPickerPage />
    case 'scanned':
      return <ScanResultPage />
    case 'organizing':
      return <OrganizeProgressPage />
    case 'waitingConfirmation':
      return <ConfirmPage />
    case 'completed':
      return <CompletedPage />
    default:
      return <DirectoryPickerPage />
  }
}

export function App() {
  const selectedPage = useAppStore((s) => s.selectedPage)
  const errorMessage = useAppStore((s) => s.errorMessage)
  const dismissError = useAppStore((s) => s.dismissError)
  const loadSettings = useAppStore((s) => s.loadSettings)

  useEffect(() => {
    loadSettings()
  }, [])

  return (
    <FluentProvider theme={webLightTheme}>
      <div className="app-layout">
        <Titlebar />
        <div className="app-body">
          <Sidebar />
          <div className="content">
            {selectedPage === 'organize' ? <OrganizePage /> : <SettingsPage />}
          </div>
        </div>
      </div>

      <PasswordDialog />

      <Dialog open={!!errorMessage} onOpenChange={(_, data) => { if (!data.open) dismissError() }}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>错误</DialogTitle>
            <DialogContent>
              <p style={{ color: 'var(--danger)', fontSize: 13 }}>{errorMessage}</p>
            </DialogContent>
            <DialogActions>
              <Button appearance="primary" onClick={dismissError}>确定</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </FluentProvider>
  )
}
