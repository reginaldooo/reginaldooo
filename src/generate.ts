import { mkdirSync, writeFileSync } from 'node:fs';
import { buildProfile } from './build-profile.js';
import { renderCards } from './cards/index.js';
import { fetchRawProfile } from './github.js';

const OUT = new URL('../profile-output/', import.meta.url);

async function main(): Promise<void> {
  const token = process.env.GH_TOKEN;
  if (!token) {
    throw new Error('GH_TOKEN is not set. Export a token with read:user and repo scopes.');
  }
  const now = new Date();
  const profile = buildProfile(await fetchRawProfile(token, now), now);
  mkdirSync(OUT, { recursive: true });
  renderCards(profile).forEach(({ file, svg }) => writeFileSync(new URL(file, OUT), svg));
  console.log(
    `Wrote cards: ${profile.stats.commits} commits, ${profile.stats.repos} repos, ` +
    `${profile.languages.length} languages.`,
  );
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
