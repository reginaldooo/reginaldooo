import { readFileSync } from 'node:fs';

interface FontFile {
  readonly family: string;
  readonly weight: number;
  readonly path: string;
}

const FONT_FILES: readonly FontFile[] = [
  { family: 'Saira Condensed', weight: 900, path: '@fontsource/saira-condensed/files/saira-condensed-latin-900-normal.woff2' },
  { family: 'Barlow', weight: 400, path: '@fontsource/barlow/files/barlow-latin-400-normal.woff2' },
  { family: 'Barlow', weight: 700, path: '@fontsource/barlow/files/barlow-latin-700-normal.woff2' },
];

let cached: string | null = null;

/**
 * GitHub renders README SVGs through <img>, which blocks external fonts, so the
 * subset fonts are inlined as base64 data URIs.
 */
export function fontFaceCss(): string {
  if (cached) return cached;
  cached = FONT_FILES.map(({ family, weight, path }) => {
    const file = new URL(`../node_modules/${path}`, import.meta.url);
    const data = readFileSync(file).toString('base64');
    return `@font-face{font-family:'${family}';font-weight:${weight};src:url(data:font/woff2;base64,${data}) format('woff2');}`;
  }).join('');
  return cached;
}
