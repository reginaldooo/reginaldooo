import { describe, expect, test } from 'vitest';
import { formatUtc, withTimestamp } from '../src/readme.js';

describe('formatUtc', () => {
  test('formats day/month/year and 24h time in UTC', () => {
    expect(formatUtc(new Date('2026-11-01T01:05:09Z'))).toBe('01/11/2026 01:05:09 UTC');
  });
});

describe('withTimestamp', () => {
  const now = new Date('2026-11-01T08:16:39Z');
  const readme = 'a\n<!--UPDATED-->old<!--/UPDATED-->\nb';

  test('replaces text between the markers', () => {
    expect(withTimestamp(readme, now)).toContain('<!--UPDATED-->Last updated on 01/11/2026 08:16:39 UTC<!--/UPDATED-->');
  });

  test('leaves the rest of the file untouched', () => {
    const out = withTimestamp(readme, now);
    expect(out.startsWith('a\n')).toBe(true);
    expect(out.endsWith('\nb')).toBe(true);
  });

  test('is a no-op when markers are missing', () => {
    expect(withTimestamp('no markers', now)).toBe('no markers');
  });
});
