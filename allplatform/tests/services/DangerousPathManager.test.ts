import { describe, it, expect, beforeEach } from 'vitest'
import { DangerousPathManager } from '../../src/main/services/DangerousPathManager'
import os from 'os'
import path from 'path'

describe('DangerousPathManager', () => {
  let manager: DangerousPathManager

  beforeEach(() => {
    manager = new DangerousPathManager()
  })

  it('system root is dangerous', () => {
    if (process.platform === 'darwin') {
      expect(manager.isSafe('/')).toBe(false)
    }
  })

  it('system paths are dangerous (macOS)', () => {
    if (process.platform !== 'darwin') return
    expect(manager.isSafe('/System')).toBe(false)
    expect(manager.isSafe('/Library')).toBe(false)
    expect(manager.isSafe('/usr')).toBe(false)
    expect(manager.isSafe('/bin')).toBe(false)
    expect(manager.isSafe('/sbin')).toBe(false)
  })

  it('user Library is dangerous (macOS)', () => {
    if (process.platform !== 'darwin') return
    const home = os.homedir()
    expect(manager.isSafe(path.join(home, 'Library'))).toBe(false)
    expect(manager.isSafe(path.join(home, 'Applications'))).toBe(false)
  })

  it('hidden directories are dangerous', () => {
    const home = os.homedir()
    expect(manager.isSafe(path.join(home, '.git'))).toBe(false)
    expect(manager.isSafe(path.join(home, '.svn'))).toBe(false)
    expect(manager.isSafe(path.join(home, '.config'))).toBe(false)
  })

  it('normal directories are safe', () => {
    const home = os.homedir()
    expect(manager.isSafe(path.join(home, 'Downloads'))).toBe(true)
    expect(manager.isSafe(path.join(home, 'Desktop'))).toBe(true)
    expect(manager.isSafe(path.join(home, 'Documents'))).toBe(true)
  })

  it('user can add custom dangerous paths', () => {
    const custom = '/tmp/my-important-data'
    manager.addUserPath(custom)
    expect(manager.isSafe(custom)).toBe(false)
  })

  it('user can remove custom paths', () => {
    const custom = '/tmp/my-important-data'
    manager.addUserPath(custom)
    manager.removeUserPath(custom)
    expect(manager.isSafe(custom)).toBe(true)
  })

  it('VCS directories are dangerous', () => {
    expect(manager.isSafe('/some/path/.git')).toBe(false)
    expect(manager.isSafe('/some/path/.svn')).toBe(false)
    expect(manager.isSafe('/some/path/.hg')).toBe(false)
  })
})
