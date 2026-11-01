import { mkdirSync, writeFileSync } from 'node:fs';
import { renderCards } from './cards/index.js';
import { sampleProfile } from '../tests/fixtures.js';

const OUT = new URL('../preview/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const cards = renderCards(sampleProfile);
cards.forEach(({ file, svg }) => writeFileSync(new URL(file, OUT), svg));

const imgs = cards.map(({ file }) => `<img src="${file}" width="495" height="195" alt="">`).join('');
writeFileSync(
  new URL('index.html', OUT),
  `<!doctype html><meta charset="utf-8"><body style="margin:24px;background:#fff;display:grid;grid-template-columns:repeat(2,495px);gap:16px">${imgs}`,
);
console.log(`Wrote ${cards.length} preview cards to preview/`);
