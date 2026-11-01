import { fontFaceCss } from '../fonts.js';
import type { ProfileData } from '../types.js';
import { languagesCard } from './languages.js';
import { overviewCard } from './overview.js';
import { productiveTimeCard } from './productive-time.js';
import { statsCard } from './stats.js';

export interface RenderedCard {
  readonly file: string;
  readonly svg: string;
}

export function renderCards(data: ProfileData): readonly RenderedCard[] {
  const fonts = fontFaceCss();
  return [
    { file: 'overview.svg', svg: overviewCard(data.overview, fonts) },
    { file: 'stats.svg', svg: statsCard(data.stats, fonts) },
    { file: 'productive-time.svg', svg: productiveTimeCard(data.productiveTime, fonts) },
    { file: 'languages.svg', svg: languagesCard(data.languages, fonts) },
  ];
}
