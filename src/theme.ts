/** Design tokens copied from the portfolio (Website Portofolio/style.css :root). */
export const theme = {
  canvas: '#fafafa',
  surfaceSoft: '#f2f2f2',
  ink: '#0d0d0d',
  body: '#404040',
  muted: '#767676',
  mutedSoft: '#a3a3a3',
  hairline: '#e2e2e2',
  hairlineStrong: '#c8c8c8',
  mBlueLight: '#0066b1',
  mBlueDark: '#1c69d4',
  mRed: '#e22718',
  display: "'Saira Condensed', 'Arial Narrow', sans-serif",
  text: "'Barlow', -apple-system, 'Segoe UI', sans-serif",
} as const;

export const CARD = { width: 495, height: 195, pad: 24, stripe: 4 } as const;

/** Language bar colours, cycled in rank order. */
export const LANGUAGE_COLORS = [
  theme.ink,
  theme.mBlueLight,
  theme.mBlueDark,
  theme.mRed,
  theme.mutedSoft,
  theme.hairlineStrong,
] as const;
