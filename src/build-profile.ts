import {
  bucketCommitTimes, computeStreaks, countActiveDays, languageShares,
} from './aggregate.js';
import { config } from './config.js';
import type { RawProfile } from './github.js';
import type { ProfileData } from './types.js';

function localDate(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(now);
}

function timeZoneLabel(timeZone: string): string {
  return timeZone === 'Asia/Jakarta' ? 'WIB' : timeZone;
}

/** Turns raw API data into the aggregate numbers the cards draw. No repo names survive this step. */
export function buildProfile(raw: RawProfile, now: Date): ProfileData {
  return {
    overview: {
      name: config.displayName,
      sinceYear: new Date(raw.createdAt).getUTCFullYear(),
      location: config.location,
      tagline: config.tagline,
    },
    stats: {
      commits: raw.commits,
      pullRequests: raw.pullRequests,
      issues: raw.issues,
      repos: raw.repos.length,
      activeDays: countActiveDays(raw.calendar),
      streaks: computeStreaks(raw.calendar, localDate(now, config.timeZone)),
    },
    productiveTime: {
      buckets: bucketCommitTimes(raw.commitTimes, config.timeZone),
      timeZoneLabel: timeZoneLabel(config.timeZone),
    },
    languages: languageShares(raw.repos, {
      exclude: config.excludeLanguages,
      limit: config.languageLimit,
    }),
  };
}
