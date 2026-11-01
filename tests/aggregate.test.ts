import { describe, expect, test } from 'vitest';
import {
  bucketCommitTimes,
  computeStreaks,
  countActiveDays,
  dominantBucket,
  languageShares,
} from '../src/aggregate.js';

const day = (date: string, count: number) => ({ date, count });

describe('countActiveDays', () => {
  test('counts only days with contributions', () => {
    const days = [day('2026-10-01', 2), day('2026-10-02', 0), day('2026-10-03', 1)];
    expect(countActiveDays(days)).toBe(2);
  });

  test('returns 0 for an empty calendar', () => {
    expect(countActiveDays([])).toBe(0);
  });
});

describe('computeStreaks', () => {
  const days = [
    day('2026-10-01', 1), day('2026-10-02', 1), day('2026-10-03', 1),
    day('2026-10-04', 0),
    day('2026-10-05', 1), day('2026-10-06', 1),
  ];

  test('finds the longest streak in the window', () => {
    expect(computeStreaks(days, '2026-10-06').longest).toBe(3);
  });

  test('current streak runs back from today', () => {
    expect(computeStreaks(days, '2026-10-06').current).toBe(2);
  });

  test('current streak survives an empty today if yesterday was active', () => {
    const withEmptyToday = [...days, day('2026-10-07', 0)];
    expect(computeStreaks(withEmptyToday, '2026-10-07').current).toBe(2);
  });

  test('current streak is 0 after a gap of two days', () => {
    const withGap = [...days, day('2026-10-07', 0), day('2026-10-08', 0)];
    expect(computeStreaks(withGap, '2026-10-08').current).toBe(0);
  });

  test('does not mutate its input', () => {
    const copy = days.map((d) => ({ ...d }));
    computeStreaks(days, '2026-10-06');
    expect(days).toEqual(copy);
  });
});

describe('bucketCommitTimes', () => {
  test('assigns commits to buckets using the target time zone', () => {
    // 2026-10-01T17:00Z = 00:00 next day in Asia/Jakarta (night)
    // 2026-10-01T01:00Z = 08:00 Jakarta (morning)
    // 2026-10-01T06:00Z = 13:00 Jakarta (day)
    // 2026-10-01T12:00Z = 19:00 Jakarta (evening)
    const result = bucketCommitTimes(
      ['2026-10-01T17:00:00Z', '2026-10-01T01:00:00Z', '2026-10-01T06:00:00Z', '2026-10-01T12:00:00Z'],
      'Asia/Jakarta',
    );
    expect(result).toEqual({ morning: 1, day: 1, evening: 1, night: 1 });
  });

  test('ignores invalid timestamps', () => {
    expect(bucketCommitTimes(['not-a-date'], 'Asia/Jakarta')).toEqual({
      morning: 0, day: 0, evening: 0, night: 0,
    });
  });
});

describe('dominantBucket', () => {
  test('returns the bucket with the most commits', () => {
    expect(dominantBucket({ morning: 1, day: 2, evening: 3, night: 9 })).toBe('night');
  });

  test('returns null when there are no commits', () => {
    expect(dominantBucket({ morning: 0, day: 0, evening: 0, night: 0 })).toBeNull();
  });
});

describe('languageShares', () => {
  const repos = [
    { language: 'Python', commits: 50 },
    { language: 'TypeScript', commits: 30 },
    { language: 'Python', commits: 10 },
    { language: null, commits: 5 },
    { language: 'Jupyter Notebook', commits: 5 },
  ];

  test('sums commits per language and sorts by share', () => {
    const shares = languageShares(repos, { exclude: [], limit: 5 });
    expect(shares.map((s) => s.name)).toEqual(['Python', 'TypeScript', 'Jupyter Notebook']);
    expect(shares[0]?.commits).toBe(60);
  });

  test('shares add up to about 100 percent', () => {
    const total = languageShares(repos, { exclude: [], limit: 5 }).reduce((n, s) => n + s.percent, 0);
    expect(total).toBeGreaterThan(99);
    expect(total).toBeLessThanOrEqual(100.5);
  });

  test('respects the exclude list', () => {
    const shares = languageShares(repos, { exclude: ['Jupyter Notebook'], limit: 5 });
    expect(shares.map((s) => s.name)).not.toContain('Jupyter Notebook');
  });

  test('folds languages past the limit into Other', () => {
    const shares = languageShares(repos, { exclude: [], limit: 2 });
    expect(shares.map((s) => s.name)).toEqual(['Python', 'TypeScript', 'Other']);
  });

  test('returns an empty list when nothing qualifies', () => {
    expect(languageShares([{ language: null, commits: 3 }], { exclude: [], limit: 5 })).toEqual([]);
  });
});
