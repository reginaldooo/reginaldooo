import { describe, expect, test } from 'vitest';
import { buildProfile } from '../src/build-profile.js';
import type { RawProfile } from '../src/github.js';

const raw: RawProfile = {
  id: 'U_1',
  createdAt: '2021-11-11T03:43:13Z',
  commits: 10,
  pullRequests: 2,
  issues: 1,
  calendar: [
    { date: '2026-10-30', count: 2 },
    { date: '2026-10-31', count: 1 },
    { date: '2026-11-01', count: 0 },
  ],
  repos: [
    { owner: 'me', name: 'secret-client-project', language: 'TypeScript', commits: 8 },
    { owner: 'me', name: 'public-thing', language: 'Python', commits: 2 },
  ],
  commitTimes: ['2026-10-31T17:30:00Z'],
};

describe('buildProfile', () => {
  const now = new Date('2026-11-01T02:00:00Z');
  const profile = buildProfile(raw, now);

  test('maps the headline numbers', () => {
    expect(profile.stats).toMatchObject({ commits: 10, pullRequests: 2, issues: 1, repos: 2, activeDays: 2 });
  });

  test('uses the local date for the current streak', () => {
    // 02:00Z on 1 Nov is 09:00 WIB on 1 Nov; today is empty, yesterday active
    expect(profile.stats.streaks.current).toBe(2);
  });

  test('reads the account creation year', () => {
    expect(profile.overview.sinceYear).toBe(2021);
  });

  test('buckets commit times in WIB', () => {
    expect(profile.productiveTime.buckets.night).toBe(1);
    expect(profile.productiveTime.timeZoneLabel).toBe('WIB');
  });

  test('never carries repository names into the output model', () => {
    expect(JSON.stringify(profile)).not.toContain('secret-client-project');
    expect(JSON.stringify(profile)).not.toContain('public-thing');
  });
});

import { repoFromNode, type RepoNode } from '../src/github.js';

describe('repoFromNode', () => {
  const node: RepoNode = {
    name: 'r', owner: { login: 'me' }, primaryLanguage: { name: 'Go' },
    defaultBranchRef: { target: { history: { totalCount: 3, nodes: [{ committedDate: '2026-10-01T00:00:00Z' }] } } },
  };

  test('maps commits, language and timestamps', () => {
    expect(repoFromNode(node)).toMatchObject({ owner: 'me', name: 'r', language: 'Go', commits: 3, times: ['2026-10-01T00:00:00Z'] });
  });

  test('skips repos with no commits by the user', () => {
    const empty = { ...node, defaultBranchRef: { target: { history: { totalCount: 0, nodes: [] } } } };
    expect(repoFromNode(empty)).toBeNull();
  });

  test('skips empty repos and null nodes', () => {
    expect(repoFromNode({ ...node, defaultBranchRef: null })).toBeNull();
    expect(repoFromNode(null)).toBeNull();
  });
});
