import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const chemin = resolve(process.env.DATABASE_PATH || './data/tiktak.sqlite');
mkdirSync(dirname(chemin), { recursive: true });

const g = globalThis;
export const db = g.__tiktakDb ?? (g.__tiktakDb = new Database(chemin));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
