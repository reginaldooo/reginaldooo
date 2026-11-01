const MARKERS = /<!--UPDATED-->[\s\S]*?<!--\/UPDATED-->/;

const pad = (n: number): string => String(n).padStart(2, '0');

/** dd/mm/yyyy hh:mm:ss UTC */
export function formatUtc(date: Date): string {
  const day = `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/${date.getUTCFullYear()}`;
  const time = `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
  return `${day} ${time} UTC`;
}

/** Rewrites the text between <!--UPDATED--> markers; returns the input unchanged without them. */
export function withTimestamp(readme: string, now: Date): string {
  return readme.replace(MARKERS, `<!--UPDATED-->Last updated on ${formatUtc(now)}<!--/UPDATED-->`);
}
