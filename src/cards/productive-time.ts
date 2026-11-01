import type { TimeBucket } from '../aggregate.js';
import { dominantBucket } from '../aggregate.js';
import { CARD, theme } from '../theme.js';
import { eyebrow, esc, formatNumber, frame } from '../svg.js';
import type { ProductiveTimeData } from '../types.js';

const ROWS: readonly { key: TimeBucket; label: string; hours: string; color: string }[] = [
  { key: 'morning', label: 'Morning', hours: '06–12', color: theme.mBlueLight },
  { key: 'day', label: 'Daytime', hours: '12–18', color: theme.mBlueDark },
  { key: 'evening', label: 'Evening', hours: '18–24', color: theme.mRed },
  { key: 'night', label: 'Night', hours: '00–06', color: theme.ink },
];

const HEADLINES: Readonly<Record<TimeBucket, string>> = {
  morning: 'Early bird',
  day: 'Daytime builder',
  evening: 'Evening builder',
  night: 'Night owl',
};

const BAR_X = 150;
const BAR_WIDTH = 230;
const FIRST_ROW_Y = 100;
const ROW_STEP = 22;

export function productiveTimeCard(data: ProductiveTimeData, fontCss: string): string {
  const total = ROWS.reduce((n, row) => n + data.buckets[row.key], 0);
  const top = dominantBucket(data.buckets);
  const headline = top ? HEADLINES[top] : 'No commits yet';

  const rows = ROWS.map((row, i) => {
    const count = data.buckets[row.key];
    const share = total > 0 ? count / total : 0;
    const y = FIRST_ROW_Y + i * ROW_STEP;
    const fill = Math.max(share * BAR_WIDTH, count > 0 ? 2 : 0);
    return [
      `<text x="${CARD.pad}" y="${y + 8}" class="label">${row.label} <tspan fill="${theme.mutedSoft}">${row.hours}</tspan></text>`,
      `<rect x="${BAR_X}" y="${y}" width="${BAR_WIDTH}" height="8" fill="${theme.hairline}"/>`,
      `<rect x="${BAR_X}" y="${y}" width="${fill.toFixed(1)}" height="8" fill="${row.color}"/>`,
      `<text x="${CARD.width - CARD.pad}" y="${y + 8}" text-anchor="end" class="strong">${formatNumber(count)} <tspan class="body">· ${(share * 100).toFixed(0)}%</tspan></text>`,
    ].join('');
  }).join('');

  const head = [
    eyebrow(`Productive time · ${esc(data.timeZoneLabel)}`),
    `<text x="${CARD.pad}" y="72" class="title">${esc(headline)}</text>`,
  ].join('');

  return frame(`${head}${rows}`, fontCss, `Commit activity by time of day, mostly ${headline}`);
}
