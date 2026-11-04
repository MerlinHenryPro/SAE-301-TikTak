import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const chemin = resolve(process.env.DATABASE_PATH || './data/tiktak.sqlite');
mkdirSync(dirname(chemin), { recursive: true });

const Database = globalThis.Bun
  ? (await import('bun:sqlite')).Database
  : (await import('better-sqlite3')).default;

const g = globalThis;
export const db = g.__tiktakDb ?? (g.__tiktakDb = new Database(chemin));
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');
