import type { BucketCounts, LanguageShare, Streaks } from './aggregate.js';

export interface StatsData {
  readonly commits: number;
  readonly pullRequests: number;
  readonly issues: number;
  readonly repos: number;
  readonly activeDays: number;
  readonly streaks: Streaks;
}

export interface ProductiveTimeData {
  readonly buckets: BucketCounts;
  readonly timeZoneLabel: string;
}

export interface OverviewData {
  readonly name: string;
  readonly sinceYear: number;
  readonly location: string;
  readonly tagline: { readonly solid: string; readonly outline: string };
}

export interface ProfileData {
  readonly overview: OverviewData;
  readonly stats: StatsData;
  readonly productiveTime: ProductiveTimeData;
  readonly languages: readonly LanguageShare[];
}
