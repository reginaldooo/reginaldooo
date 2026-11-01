import type { LanguageShare } from '../aggregate.js';
import { CARD, LANGUAGE_COLORS, theme } from '../theme.js';
import { eyebrow, esc, frame } from '../svg.js';

const BAR_WIDTH = CARD.width - CARD.pad * 2;
const COLUMN_WIDTH = BAR_WIDTH / 2;
const LEGEND_TOP = 106;
const LEGEND_STEP = 26;

function colorAt(index: number): string {
  return LANGUAGE_COLORS[index % LANGUAGE_COLORS.length] ?? theme.ink;
}

export function languagesCard(shares: readonly LanguageShare[], fontCss: string): string {
  const total = shares.reduce((n, s) => n + s.percent, 0) || 1;

  const segments = shares.reduce<{ x: number; svg: string[] }>(
    (acc, share, i) => {
      const width = (share.percent / total) * BAR_WIDTH;
      const rect = `<rect x="${(CARD.pad + acc.x).toFixed(1)}" y="56" width="${width.toFixed(1)}" height="10" fill="${colorAt(i)}"/>`;
      return { x: acc.x + width, svg: [...acc.svg, rect] };
    },
    { x: 0, svg: [] },
  ).svg.join('');

  const legend = shares.map((share, i) => {
    const x = CARD.pad + (i % 2) * COLUMN_WIDTH;
    const y = LEGEND_TOP + Math.floor(i / 2) * LEGEND_STEP;
    return [
      `<rect x="${x}" y="${y - 9}" width="9" height="9" fill="${colorAt(i)}"/>`,
      `<text x="${x + 16}" y="${y}" class="strong">${esc(share.name)}</text>`,
      `<text x="${x + COLUMN_WIDTH - 24}" y="${y}" text-anchor="end" class="body">${share.percent.toFixed(1)}%</text>`,
    ].join('');
  }).join('');

  const empty = shares.length === 0
    ? `<text x="${CARD.pad}" y="96" class="body">No language data yet.</text>`
    : '';

  return frame(
    `${eyebrow('Top languages · by commits')}${segments}${legend}${empty}`,
    fontCss,
    'Top languages by commits',
  );
}
