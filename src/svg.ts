import { CARD, theme } from './theme.js';

const ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
};

export function esc(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => ESCAPES[ch] ?? ch);
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/** Three-segment M tricolor along the top edge. */
function stripe(): string {
  const w = CARD.width / 3;
  return [theme.mBlueLight, theme.mBlueDark, theme.mRed]
    .map((fill, i) => `<rect x="${i * w}" y="0" width="${w}" height="${CARD.stripe}" fill="${fill}"/>`)
    .join('');
}

export function eyebrow(text: string, y = 38): string {
  return `<text x="${CARD.pad}" y="${y}" class="eyebrow">${esc(text)}</text>`;
}

const BASE_CSS = `
  .eyebrow{font:700 10px ${theme.text};letter-spacing:2px;text-transform:uppercase;fill:${theme.muted}}
  .label{font:700 10px ${theme.text};letter-spacing:1.5px;text-transform:uppercase;fill:${theme.muted}}
  .num{font:900 34px ${theme.display};fill:${theme.ink}}
  .title{font:900 30px ${theme.display};text-transform:uppercase;fill:${theme.ink}}
  .body{font:400 12px ${theme.text};fill:${theme.body}}
  .strong{font:700 12px ${theme.text};fill:${theme.ink}}
`;

/** Wraps card content in the shared frame: canvas, hairline border, M stripe, fonts. */
export function frame(inner: string, fontCss: string, title: string): string {
  const { width, height } = CARD;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}">`,
    `<title>${esc(title)}</title>`,
    `<style>${fontCss}${BASE_CSS}</style>`,
    `<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" fill="${theme.canvas}" stroke="${theme.hairline}"/>`,
    stripe(),
    inner,
    '</svg>',
  ].join('');
}
