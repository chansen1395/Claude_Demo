export const theme = {
  colors: {
    bg: '#0a0a1a',
    bgGradientStart: '#0a0a1a',
    bgGradientEnd: '#0f0f2e',
    panelBgStart: 'rgba(17,17,40,0.92)',
    panelBgEnd: 'rgba(25,25,55,0.85)',
    headerBg: 'rgba(15,15,46,0.7)',
    footerBg: 'rgba(15,15,46,0.85)',
    accent: '#00ff88',
    accentBlue: '#4488ff',
    accentRed: '#ff4466',
    accentOrange: '#ff9933',
    accentWarn: '#ffaa44',
    text: '#e0e0e8',
    textMuted: '#6677aa',
    textLabel: '#5588cc',
    border: 'rgba(0,255,136,0.15)',
    borderPanel: 'rgba(0,255,136,0.18)',
    borderBrain: 'rgba(68,136,255,0.25)',
    borderGraph: 'rgba(255,68,102,0.2)',
    statBg: 'rgba(0,255,136,0.04)',
    statBorder: 'rgba(0,255,136,0.12)',
  },
  fonts: {
    body: "system-ui, -apple-system, sans-serif",
    mono: "'Courier New', monospace",
  },
} as const;

export type Theme = typeof theme;
