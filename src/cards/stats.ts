import { CARD, theme } from '../theme.js';
import { eyebrow, formatNumber, frame } from '../svg.js';
import type { StatsData } from '../types.js';

const COLUMN_WIDTH = 155;
const ROW_TOPS = [92, 160] as const;

interface Cell {
  readonly value: string;
  readonly label: string;
}

function cells(stats: StatsData): readonly Cell[] {
  return [
    { value: formatNumber(stats.commits), label: 'Commits' },
    { value: formatNumber(stats.pullRequests), label: 'Pull requests' },
    { value: formatNumber(stats.issues), label: 'Issues' },
    { value: formatNumber(stats.repos), label: 'Repos active' },
    { value: formatNumber(stats.activeDays), label: 'Active days' },
    { value: `${stats.streaks.current}`, label: `Day streak · best ${stats.streaks.longest}` },
  ];
}

export function statsCard(stats: StatsData, fontCss: string): string {
  const body = cells(stats)
    .map((cell, i) => {
      const x = CARD.pad + (i % 3) * COLUMN_WIDTH;
      const y = ROW_TOPS[Math.floor(i / 3)] ?? ROW_TOPS[0];
      return [
        `<text x="${x}" y="${y}" class="num">${cell.value}</text>`,
        `<text x="${x}" y="${y + 17}" class="label">${cell.label}</text>`,
      ].join('');
    })
    .join('');
  const divider = `<line x1="${CARD.pad}" y1="126" x2="${CARD.width - CARD.pad}" y2="126" stroke="${theme.hairline}"/>`;
  return frame(
    `${eyebrow('Activity · last 12 months')}${body}${divider}`,
    fontCss,
    'GitHub activity statistics',
  );
}
