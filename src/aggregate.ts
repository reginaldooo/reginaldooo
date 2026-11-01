export interface CalendarDay {
  readonly date: string;
  readonly count: number;
}

export interface Streaks {
  readonly current: number;
  readonly longest: number;
}

export type TimeBucket = 'morning' | 'day' | 'evening' | 'night';
export type BucketCounts = Readonly<Record<TimeBucket, number>>;

export interface RepoCommits {
  readonly language: string | null;
  readonly commits: number;
}

export interface LanguageShare {
  readonly name: string;
  readonly commits: number;
  readonly percent: number;
}

const DAY_MS = 86_400_000;
const EMPTY_BUCKETS: BucketCounts = { morning: 0, day: 0, evening: 0, night: 0 };

export function countActiveDays(days: readonly CalendarDay[]): number {
  return days.filter((d) => d.count > 0).length;
}

function previousDate(date: string): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) - DAY_MS).toISOString().slice(0, 10);
}

export function computeStreaks(days: readonly CalendarDay[], today: string): Streaks {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));

  const longest = sorted.reduce(
    (acc, d) => {
      const run = d.count > 0 ? acc.run + 1 : 0;
      return { run, best: Math.max(acc.best, run) };
    },
    { run: 0, best: 0 },
  ).best;

  const active = new Set(sorted.filter((d) => d.count > 0).map((d) => d.date));
  // Today may not have a commit yet, so the streak can still end yesterday.
  let cursor = active.has(today) ? today : previousDate(today);
  let current = 0;
  while (active.has(cursor)) {
    current += 1;
    cursor = previousDate(cursor);
  }

  return { current, longest };
}

function bucketForHour(hour: number): TimeBucket {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'day';
  if (hour >= 18) return 'evening';
  return 'night';
}

export function bucketCommitTimes(timestamps: readonly string[], timeZone: string): BucketCounts {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit', hourCycle: 'h23', timeZone,
  });
  return timestamps.reduce<BucketCounts>((acc, iso) => {
    const time = Date.parse(iso);
    if (Number.isNaN(time)) return acc;
    const bucket = bucketForHour(Number(formatter.format(new Date(time))));
    return { ...acc, [bucket]: acc[bucket] + 1 };
  }, EMPTY_BUCKETS);
}

export function dominantBucket(counts: BucketCounts): TimeBucket | null {
  const entries = (Object.entries(counts) as [TimeBucket, number][]).sort((a, b) => b[1] - a[1]);
  const top = entries[0];
  return top && top[1] > 0 ? top[0] : null;
}

export function languageShares(
  repos: readonly RepoCommits[],
  options: { readonly exclude: readonly string[]; readonly limit: number },
): LanguageShare[] {
  const excluded = new Set(options.exclude.map((n) => n.toLowerCase()));
  const totals = repos.reduce((map, repo) => {
    if (!repo.language || excluded.has(repo.language.toLowerCase())) return map;
    return new Map(map).set(repo.language, (map.get(repo.language) ?? 0) + repo.commits);
  }, new Map<string, number>());

  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  const grandTotal = sorted.reduce((n, [, commits]) => n + commits, 0);
  if (grandTotal === 0) return [];

  const head = sorted.slice(0, options.limit);
  const restCommits = sorted.slice(options.limit).reduce((n, [, commits]) => n + commits, 0);
  const rows = restCommits > 0 ? [...head, ['Other', restCommits] as [string, number]] : head;

  return rows.map(([name, commits]) => ({
    name,
    commits,
    percent: Math.round((commits / grandTotal) * 1000) / 10,
  }));
}
