import { describe, it, expect } from 'vitest';
import { theme } from '../theme';

describe('theme', () => {
  it('exports a theme object with colors', () => {
    expect(theme.colors).toBeDefined();
    expect(theme.colors.bg).toBe('#0a0a1a');
    expect(theme.colors.accent).toBe('#00ff88');
  });

  it('has font definitions', () => {
    expect(theme.fonts).toBeDefined();
    expect(theme.fonts.body).toContain('system-ui');
    expect(theme.fonts.mono).toContain('monospace');
  });

  it('has all required color keys', () => {
    const requiredKeys = [
      'bg', 'bgGradientStart', 'bgGradientEnd',
      'panelBgStart', 'panelBgEnd', 'headerBg', 'footerBg',
      'accent', 'accentBlue', 'accentRed', 'accentOrange', 'accentWarn',
      'text', 'textMuted', 'textLabel',
      'border', 'borderPanel', 'borderBrain', 'borderGraph',
      'statBg', 'statBorder',
    ];
    for (const key of requiredKeys) {
      expect(theme.colors).toHaveProperty(key);
    }
  });
});
