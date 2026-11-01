import { describe, expect, test } from 'vitest';
import { renderCards } from '../src/cards/index.js';
import { languagesCard } from '../src/cards/languages.js';
import { productiveTimeCard } from '../src/cards/productive-time.js';
import { esc } from '../src/svg.js';
import { sampleProfile } from './fixtures.js';

describe('esc', () => {
  test('escapes markup characters', () => {
    expect(esc(`<a href="x">&'`)).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&apos;');
  });
});

describe('renderCards', () => {
  const cards = renderCards(sampleProfile);

  test('produces the four card files', () => {
    expect(cards.map((c) => c.file)).toEqual([
      'overview.svg', 'stats.svg', 'productive-time.svg', 'languages.svg',
    ]);
  });

  test('every card is a self-contained SVG with inlined fonts', () => {
    for (const { svg } of cards) {
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('data:font/woff2;base64,');
      expect(svg).not.toMatch(/https?:\/\/(?!www\.w3\.org)/);
    }
  });

  test('stats card shows the numbers', () => {
    const stats = cards.find((c) => c.file === 'stats.svg')?.svg ?? '';
    expect(stats).toContain('1,284');
    expect(stats).toContain('best 19');
  });
});

describe('productiveTimeCard', () => {
  test('names the dominant time of day', () => {
    expect(productiveTimeCard(sampleProfile.productiveTime, '')).toContain('Night owl');
  });

  test('handles zero commits without dividing by zero', () => {
    const svg = productiveTimeCard(
      { buckets: { morning: 0, day: 0, evening: 0, night: 0 }, timeZoneLabel: 'WIB' }, '',
    );
    expect(svg).toContain('No commits yet');
    expect(svg).not.toContain('NaN');
  });
});

describe('languagesCard', () => {
  test('escapes language names', () => {
    const svg = languagesCard([{ name: 'C++ <x>', commits: 1, percent: 100 }], '');
    expect(svg).toContain('C++ &lt;x&gt;');
  });

  test('renders an empty state', () => {
    expect(languagesCard([], '')).toContain('No language data yet.');
  });
});
