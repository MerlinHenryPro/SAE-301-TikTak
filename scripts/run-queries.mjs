// Exécute chaque requête de database/requetes.sql et affiche le résultat
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';

const db = new Database(process.env.DATABASE_PATH || './data/tiktak.sqlite', { readonly: true });
const blocs = readFileSync('database/requetes.sql', 'utf8').split(/\n(?=-- \d+\.)/).slice(1);
for (const bloc of blocs) {
  const titre = bloc.split('\n')[0];
  const sql = bloc.split('\n').filter((l) => !l.startsWith('--')).join('\n').trim();
  console.log('\n' + titre);
  console.table(db.prepare(sql).all());
}
