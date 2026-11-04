import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';

const db = new Database(process.env.DATABASE_PATH || './data/tiktak.sqlite', { readonly: true });
const requetes = readFileSync('database/requetes.sql', 'utf8').split(';').map((r) => r.trim()).filter(Boolean);
requetes.forEach((sql, i) => {
  console.log(`\nRequête ${i + 1}`);
  console.table(db.prepare(sql).all());
});
