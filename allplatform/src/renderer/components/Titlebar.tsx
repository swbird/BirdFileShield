import React from 'react'
import logoImg from '../../../resources/icon.png'

const isMac = navigator.platform.includes('Mac')

export function Titlebar() {
  return (
    <div className={`titlebar${isMac ? ' titlebar-mac' : ''}`}>
      <div className="titlebar-brand">
        <img className="titlebar-logo" src={logoImg} alt="logo" />
        <span className="titlebar-name">BirdFileShield</span>
      </div>
    </div>
  )
}
