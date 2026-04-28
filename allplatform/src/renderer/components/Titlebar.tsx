import React from 'react'
import logoImg from '../../../resources/icon.png'

const isMac = navigator.userAgent.includes('Macintosh')

export function Titlebar() {
  return (
    <div className={`titlebar${isMac ? ' titlebar-mac' : ''}`}>
      <div className="titlebar-brand">
        <img className="titlebar-logo" src={logoImg} alt="logo" />
        <span className="titlebar-name">BirdFileShield</span>
      </div>
      {!isMac && (
        <div className="titlebar-controls">
          <button className="tb-btn tb-min" onClick={() => (window as any).api.minimize()} aria-label="Minimize">
            <svg width="10" height="1" viewBox="0 0 10 1"><rect width="10" height="1" fill="currentColor"/></svg>
          </button>
          <button className="tb-btn tb-max" onClick={() => (window as any).api.maximize()} aria-label="Maximize">
            <svg width="10" height="10" viewBox="0 0 10 10"><rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" fill="none" strokeWidth="1"/></svg>
          </button>
          <button className="tb-btn tb-close" onClick={() => (window as any).api.close()} aria-label="Close">
            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.2"/></svg>
          </button>
        </div>
      )}
    </div>
  )
}
