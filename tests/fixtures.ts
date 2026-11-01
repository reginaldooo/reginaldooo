import type { ProfileData } from '../src/types.js';

export const sampleProfile: ProfileData = {
  overview: {
    name: 'Reginaldo Ahnaf',
    sinceYear: 2021,
    location: 'Indonesia',
    tagline: { solid: 'PROBLEM FIRST.', outline: 'THEN BUILD.' },
  },
  stats: {
    commits: 1284,
    pullRequests: 37,
    issues: 12,
    repos: 18,
    activeDays: 143,
    streaks: { current: 4, longest: 19 },
  },
  productiveTime: {
    buckets: { morning: 120, day: 310, evening: 402, night: 452 },
    timeZoneLabel: 'WIB',
  },
  languages: [
    { name: 'TypeScript', commits: 540, percent: 42.1 },
    { name: 'Python', commits: 380, percent: 29.6 },
    { name: 'Jupyter Notebook', commits: 190, percent: 14.8 },
    { name: 'JavaScript', commits: 110, percent: 8.6 },
    { name: 'Go', commits: 40, percent: 3.1 },
    { name: 'Other', commits: 24, percent: 1.9 },
  ],
};
