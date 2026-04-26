import { describe, it, expect } from 'vitest'
import { getCategoryDisplayName, getCategoryIcon, getCategoryFromExtension, getAllCategories, getAllDisplayNames } from '../../src/main/models/FileCategory'
import { FileCategory } from '../../src/shared/types'

describe('FileCategory', () => {
  it('displayName returns Chinese name', () => {
    expect(getCategoryDisplayName(FileCategory.Document)).toBe('文档')
    expect(getCategoryDisplayName(FileCategory.Pdf)).toBe('PDF')
    expect(getCategoryDisplayName(FileCategory.Image)).toBe('图片')
    expect(getCategoryDisplayName(FileCategory.AudioVideo)).toBe('音视频')
    expect(getCategoryDisplayName(FileCategory.SensitiveConfig)).toBe('敏感配置')
    expect(getCategoryDisplayName(FileCategory.Other)).toBe('其他')
  })

  it('from extension maps correctly', () => {
    expect(getCategoryFromExtension('txt')).toBe(FileCategory.Document)
    expect(getCategoryFromExtension('docx')).toBe(FileCategory.Document)
    expect(getCategoryFromExtension('pdf')).toBe(FileCategory.Pdf)
    expect(getCategoryFromExtension('xlsx')).toBe(FileCategory.Spreadsheet)
    expect(getCategoryFromExtension('pptx')).toBe(FileCategory.Presentation)
    expect(getCategoryFromExtension('png')).toBe(FileCategory.Image)
    expect(getCategoryFromExtension('jpg')).toBe(FileCategory.Image)
    expect(getCategoryFromExtension('mp4')).toBe(FileCategory.AudioVideo)
    expect(getCategoryFromExtension('mp3')).toBe(FileCategory.AudioVideo)
    expect(getCategoryFromExtension('exe')).toBe(FileCategory.Installer)
    expect(getCategoryFromExtension('dmg')).toBe(FileCategory.Installer)
    expect(getCategoryFromExtension('zip')).toBe(FileCategory.Archive)
    expect(getCategoryFromExtension('torrent')).toBe(FileCategory.Torrent)
    expect(getCategoryFromExtension('swift')).toBe(FileCategory.Code)
    expect(getCategoryFromExtension('psd')).toBe(FileCategory.Design)
    expect(getCategoryFromExtension('ttf')).toBe(FileCategory.Font)
    expect(getCategoryFromExtension('sqlite')).toBe(FileCategory.Database)
    expect(getCategoryFromExtension('epub')).toBe(FileCategory.Ebook)
    expect(getCategoryFromExtension('env')).toBe(FileCategory.SensitiveConfig)
    expect(getCategoryFromExtension('yaml')).toBe(FileCategory.SensitiveConfig)
    expect(getCategoryFromExtension('pem')).toBe(FileCategory.SensitiveConfig)
  })

  it('unknown extension returns Other', () => {
    expect(getCategoryFromExtension('xyz123')).toBe(FileCategory.Other)
    expect(getCategoryFromExtension('')).toBe(FileCategory.Other)
  })

  it('case insensitive matching', () => {
    expect(getCategoryFromExtension('PDF')).toBe(FileCategory.Pdf)
    expect(getCategoryFromExtension('JPG')).toBe(FileCategory.Image)
    expect(getCategoryFromExtension('Docx')).toBe(FileCategory.Document)
  })

  it('all categories have icon', () => {
    for (const cat of getAllCategories()) {
      expect(getCategoryIcon(cat)).not.toBe('')
    }
  })

  it('display names are unique', () => {
    const names = getAllDisplayNames()
    expect(new Set(names).size).toBe(names.length)
  })
})
