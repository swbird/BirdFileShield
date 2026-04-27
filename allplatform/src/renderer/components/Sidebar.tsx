import React from 'react'
import { useAppStore } from '../stores/appStore'
import logoImg from '../../../resources/icon.png'
import { IFolder, ISettings, ILock } from './icons'

export function Sidebar() {
  const selectedPage = useAppStore((s) => s.selectedPage)
  const setSelectedPage = useAppStore((s) => s.setSelectedPage)

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <img className="bfs-brand-logo" src={logoImg} alt="logo" />
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-name">BirdFileShield</div>
          <div className="sidebar-brand-version">v1.0.0</div>
        </div>
      </div>

      <div className="sidebar-nav">
        <button
          className={`sidebar-item${selectedPage === 'organize' ? ' active' : ''}`}
          onClick={() => setSelectedPage('organize')}
        >
          <span className="sidebar-icon"><IFolder size={16}/></span>
          文件整理
        </button>
        <button
          className={`sidebar-item${selectedPage === 'settings' ? ' active' : ''}`}
          onClick={() => setSelectedPage('settings')}
        >
          <span className="sidebar-icon"><ISettings size={16}/></span>
          设置
        </button>
      </div>

      <div className="sidebar-footer">
        <ILock size={13}/> 本地处理 · 无网络请求
      </div>
    </nav>
  )
}
