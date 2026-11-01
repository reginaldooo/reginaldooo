import { CARD, theme } from '../theme.js';
import { eyebrow, esc, frame } from '../svg.js';
import type { OverviewData } from '../types.js';

export function overviewCard(data: OverviewData, fontCss: string): string {
  const name = `<text x="${CARD.pad}" y="92" style="font:900 46px ${theme.display};text-transform:uppercase;fill:${theme.ink}">${esc(data.name)}</text>`;
  const tagline = `<text x="${CARD.pad}" y="132" style="font:900 28px ${theme.display}"><tspan fill="${theme.ink}">${esc(data.tagline.solid)}</tspan><tspan dx="10" fill="none" stroke="${theme.mutedSoft}" stroke-width="1.2">${esc(data.tagline.outline)}</tspan></text>`;
  const meta = `<text x="${CARD.pad}" y="168" class="body">On GitHub since ${data.sinceYear} · ${esc(data.location)}</text>`;
  return frame(`${eyebrow('GitHub')}${name}${tagline}${meta}`, fontCss, `${data.name} GitHub profile`);
}
