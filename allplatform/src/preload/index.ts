import { contextBridge, ipcRenderer, webUtils } from 'electron'

contextBridge.exposeInMainWorld('api', {
  getPathForFile: (file: File) => webUtils.getPathForFile(file),
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  pickDirectory: () => ipcRenderer.invoke('dialog:pick-directory'),
  setDirectory: (p: string) => ipcRenderer.invoke('directory:set', p),
  scan: (dir: string, includeFolders: boolean, deepScan: boolean) => ipcRenderer.invoke('scan:start', dir, includeFolders, deepScan),
  copyFiles: (scanResult: any) => ipcRenderer.invoke('organize:copy', scanResult),
  deleteOriginals: (scanResult: any) => ipcRenderer.invoke('organize:delete-originals', scanResult),
  rollback: () => ipcRenderer.invoke('organize:rollback'),
  checkPrivateKeys: (files: any[]) => ipcRenderer.invoke('security:check-private-keys', files),
  handleSensitiveFiles: (scanResult: any, pw: string) => ipcRenderer.invoke('security:handle-sensitive-files', scanResult, pw),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (s: any) => ipcRenderer.invoke('settings:set', s),
  getDangerousPaths: () => ipcRenderer.invoke('dangerous-paths:get'),
  addDangerousPath: (p: string) => ipcRenderer.invoke('dangerous-paths:add', p),
  removeDangerousPath: (p: string) => ipcRenderer.invoke('dangerous-paths:remove', p),
  openInExplorer: (p: string) => ipcRenderer.invoke('directory:open-in-explorer', p),
  onProgress: (cb: (data: any) => void) => {
    ipcRenderer.on('organize:progress', (_e, data) => cb(data))
  },
  onStateChange: (cb: (data: any) => void) => {
    ipcRenderer.on('organize:state-change', (_e, data) => cb(data))
  },
})
