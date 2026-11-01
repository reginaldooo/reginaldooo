export const config = {
  displayName: 'Reginaldo Ahnaf',
  tagline: { solid: 'PROBLEM FIRST.', outline: 'THEN BUILD.' },
  location: 'Indonesia',
  timeZone: 'Asia/Jakarta',
  /** Languages left out of the language card (case-insensitive). */
  excludeLanguages: [] as readonly string[],
  languageLimit: 5,
  /** Repos whose commit times are sampled for the productive-time card. */
  timeSampleRepos: 20,
  /** Latest commits read per repo for the productive-time card. */
  commitsPerRepo: 100,
} as const;
