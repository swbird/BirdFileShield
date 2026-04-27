import React from 'react'

export interface IconProps {
  size?: number
  stroke?: number
  style?: React.CSSProperties
  className?: string
}

function Icon({ children, size = 20, stroke = 1.5, style, className }: IconProps & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={stroke}
         strokeLinecap="round" strokeLinejoin="round"
         style={style} className={className}>
      {children}
    </svg>
  )
}

export function BirdShield({ size = 32, accent }: { size?: number; accent?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 3 L27 7 V15 C27 21.5 22 26.5 16 29 C10 26.5 5 21.5 5 15 V7 Z"
            stroke={accent || 'currentColor'} strokeWidth="1.6" fill="none"/>
      <path d="M11.5 14 C 11.5 14 13 11 16 11 C 19 11 21 13 21 15.5 C 21 18 19 20 16.5 20 L 13 20 L 14.5 17.5 L 11.5 17.5 Z"
            fill={accent || 'currentColor'} opacity="0.9"/>
      <circle cx="19" cy="13.5" r="0.7" fill="#fff"/>
    </svg>
  )
}

// ── Navigation / UI icons ──

export const IFolder = (p: IconProps) => <Icon {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></Icon>

export const ISettings = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Icon>

export const IShield = (p: IconProps) => <Icon {...p}><path d="M12 2 L20 5 V11 C20 16 16 20 12 22 C8 20 4 16 4 11 V5 Z"/></Icon>

export const IShieldKey = (p: IconProps) => <Icon {...p}><path d="M12 2 L20 5 V11 C20 16 16 20 12 22 C8 20 4 16 4 11 V5 Z"/><circle cx="10" cy="13" r="2"/><path d="M11.5 13 H16 M14 13 V16 M16 13 V15"/></Icon>

export const IKey = (p: IconProps) => <Icon {...p}><circle cx="8" cy="15" r="3.5"/><path d="M11 13.5 L21 3.5 M18 6.5 L20.5 9 M16 8.5 L18 10.5"/></Icon>

export const IArrowLeft = (p: IconProps) => <Icon {...p}><path d="M19 12H5M12 19l-7-7 7-7"/></Icon>

export const IArrowRight = (p: IconProps) => <Icon {...p}><path d="M5 12h14M12 5l7 7-7 7"/></Icon>

export const IChevronDown = (p: IconProps) => <Icon {...p}><path d="M6 9l6 6 6-6"/></Icon>

export const IChevronUp = (p: IconProps) => <Icon {...p}><path d="M18 15l-6-6-6 6"/></Icon>

export const ICheck = (p: IconProps) => <Icon {...p}><path d="M20 6 9 17l-5-5"/></Icon>

export const IX = (p: IconProps) => <Icon {...p}><path d="M18 6L6 18M6 6l12 12"/></Icon>

export const IAlert = (p: IconProps) => <Icon {...p}><path d="M12 2L2 20h20L12 2z"/><path d="M12 9v4M12 17h.01"/></Icon>

export const IUpload = (p: IconProps) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></Icon>

export const ISearch = (p: IconProps) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></Icon>

export const ISparkle = (p: IconProps) => <Icon {...p}><path d="M12 3l1.5 5L19 9.5 13.5 11 12 17l-1.5-6L5 9.5 10.5 8z"/></Icon>

export const IClipboard = (p: IconProps) => <Icon {...p}><rect x="8" y="3" width="8" height="4" rx="1"/><path d="M8 5H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3"/></Icon>

export const IExternal = (p: IconProps) => <Icon {...p}><path d="M14 3h7v7M21 3l-9 9M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/></Icon>

export const IRefresh = (p: IconProps) => <Icon {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/></Icon>

export const ITrash = (p: IconProps) => <Icon {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/></Icon>

export const IUndo = (p: IconProps) => <Icon {...p}><path d="M3 7v6h6M3 13a9 9 0 1 0 3-7"/></Icon>

export const ILock = (p: IconProps) => <Icon {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></Icon>

export const IEye = (p: IconProps) => <Icon {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></Icon>

export const IEyeOff = (p: IconProps) => <Icon {...p}><path d="M17.94 17.94A10 10 0 0 1 12 19c-6 0-10-7-10-7a18 18 0 0 1 4.06-5.06M9.9 4.24A10 10 0 0 1 12 4c6 0 10 7 10 7a18 18 0 0 1-2.16 3.18M14.12 14.12a3 3 0 1 1-4.24-4.24M2 2l20 20"/></Icon>

export const IPlus = (p: IconProps) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>

export const IDownload = (p: IconProps) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></Icon>

export function IDot({ size = 6, color }: { size?: number; color?: string }) {
  return <span style={{ display: 'inline-block', width: size, height: size, borderRadius: '50%', background: color }} />
}

// ── Category icons ──

export const CIDocument = (p: IconProps) => <Icon {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8M8 9h2"/></Icon>

export const CIPdf = (p: IconProps) => <Icon {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><text x="7.5" y="18" fontSize="5.5" fontWeight="700" fill="currentColor" stroke="none">PDF</text></Icon>

export const CISpreadsheet = (p: IconProps) => <Icon {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16M15 4v16"/></Icon>

export const CIPresentation = (p: IconProps) => <Icon {...p}><rect x="3" y="3" width="18" height="14" rx="1"/><path d="M8 21h8M12 17v4M7 9l3 3 3-3 4 4"/></Icon>

export const CIImage = (p: IconProps) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></Icon>

export const CIAV = (p: IconProps) => <Icon {...p}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 9l5 3-5 3z" fill="currentColor"/></Icon>

export const CIInstaller = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></Icon>

export const CIArchive = (p: IconProps) => <Icon {...p}><rect x="3" y="3" width="18" height="6" rx="1"/><path d="M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4"/></Icon>

export const CITorrent = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></Icon>

export const CICode = (p: IconProps) => <Icon {...p}><path d="M16 18l6-6-6-6M8 6l-6 6 6 6M14 4l-4 16"/></Icon>

export const CIDesign = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="7.5" r="1.2"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="9" cy="16" r="1.2"/><circle cx="15.5" cy="15" r="1.2"/><path d="M16.5 9.5l-3 5"/></Icon>

export const CIFont = (p: IconProps) => <Icon {...p}><path d="M5 20l5-15h4l5 15M7.5 14h9"/></Icon>

export const CIDatabase = (p: IconProps) => <Icon {...p}><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></Icon>

export const CIEbook = (p: IconProps) => <Icon {...p}><path d="M4 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H4zM20 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z"/></Icon>

export const CISensitive = (p: IconProps) => <Icon {...p}><path d="M12 2 L20 5 V11 C20 16 16 20 12 22 C8 20 4 16 4 11 V5 Z"/><path d="M9 11h6M12 11v4"/></Icon>

export const CIFolder = (p: IconProps) => <Icon {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></Icon>

export const CIOther = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01"/></Icon>

export const CATEGORY_ICONS: Record<string, React.FC<IconProps>> = {
  document: CIDocument,
  pdf: CIPdf,
  spreadsheet: CISpreadsheet,
  presentation: CIPresentation,
  image: CIImage,
  audioVideo: CIAV,
  installer: CIInstaller,
  archive: CIArchive,
  torrent: CITorrent,
  code: CICode,
  design: CIDesign,
  font: CIFont,
  database: CIDatabase,
  ebook: CIEbook,
  sensitiveConfig: CISensitive,
  folder: CIFolder,
  other: CIOther,
}
