import os from 'os'
import path from 'path'

const MACOS_SYSTEM_PATHS = new Set([
  '/', '/System', '/Library', '/usr', '/bin', '/sbin', '/etc', '/var', '/private'
])

const MACOS_USER_RELATIVE = ['Library', 'Applications']

const WIN_SYSTEM_PATHS = new Set([
  'C:\\Windows',
  'C:\\Program Files',
  'C:\\Program Files (x86)',
  'C:\\ProgramData',
  'C:\\'
])

const VCS_DIRS = new Set(['.git', '.svn', '.hg'])

export class DangerousPathManager {
  readonly defaultPaths: Set<string>
  private userPaths: Set<string>

  constructor() {
    const home = os.homedir()
    const defaults = new Set<string>()

    if (process.platform === 'darwin') {
      for (const p of MACOS_SYSTEM_PATHS) defaults.add(p)
      for (const rel of MACOS_USER_RELATIVE) defaults.add(path.join(home, rel))
    } else if (process.platform === 'win32') {
      for (const p of WIN_SYSTEM_PATHS) defaults.add(p)
      defaults.add(path.join(home, 'AppData'))
    }

    this.defaultPaths = defaults
    this.userPaths = new Set()
  }

  isSafe(targetPath: string): boolean {
    const normalized = path.resolve(targetPath)

    if (this.defaultPaths.has(normalized) || this.userPaths.has(normalized)) {
      return false
    }

    const basename = path.basename(normalized)

    if (basename.startsWith('.')) {
      return false
    }

    if (VCS_DIRS.has(basename)) {
      return false
    }

    return true
  }

  addUserPath(p: string): void {
    this.userPaths.add(path.resolve(p))
  }

  removeUserPath(p: string): void {
    this.userPaths.delete(path.resolve(p))
  }

  getUserPaths(): string[] {
    return Array.from(this.userPaths).sort()
  }

  getDefaultPaths(): string[] {
    return Array.from(this.defaultPaths).sort()
  }

  loadUserPaths(paths: string[]): void {
    this.userPaths = new Set(paths.map(p => path.resolve(p)))
  }
}
