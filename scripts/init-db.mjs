// Crée la base SQLite à partir de database/schema.sql + database/seed.sql
// Usage : bun run db:init   (ou DATABASE_PATH=/var/www/tiktak/data/tiktak.sqlite bun run db:init)
import Database from 'better-sqlite3';
import { readFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { scryptSync, randomBytes } from 'node:crypto';
import { genererSvg } from '../src/lib/watch-core.js';

const chemin = resolve(process.env.DATABASE_PATH || './data/tiktak.sqlite');
mkdirSync(dirname(chemin), { recursive: true });
for (const f of [chemin, chemin + '-wal', chemin + '-shm']) if (existsSync(f)) rmSync(f);

const db = new Database(chemin);
db.pragma('foreign_keys = ON');
db.exec(readFileSync('database/schema.sql', 'utf8'));
db.exec(readFileSync('database/seed.sql', 'utf8'));

// Mot de passe réel des comptes de démo
const hash = (mdp) => {
  const sel = randomBytes(16).toString('hex');
  return `scrypt$${sel}$${scryptSync(mdp, sel, 64).toString('hex')}`;
};
const majMdp = db.prepare('UPDATE utilisateur SET mot_de_passe = ? WHERE id_utilisateur = ?');
for (const { id_utilisateur } of db.prepare('SELECT id_utilisateur FROM utilisateur').all()) {
  majMdp.run(hash('tiktak2026'), id_utilisateur);
}

// Génère le SVG de chaque montre de démo
const template = readFileSync('src/assets/montre.svg', 'utf8');
const compos = db.prepare(
  'SELECT c.* FROM montre_composant mc JOIN composant c USING (id_composant) WHERE mc.id_montre = ?'
);
const majSvg = db.prepare('UPDATE montre SET svg = ? WHERE id_montre = ?');
for (const { id_montre } of db.prepare('SELECT id_montre FROM montre').all()) {
  majSvg.run(genererSvg(template, compos.all(id_montre)), id_montre);
}

const n = (t) => db.prepare(`SELECT COUNT(*) n FROM ${t}`).get().n;
console.log(`Base créée : ${chemin}`);
console.log(`  ${n('utilisateur')} utilisateurs, ${n('composant')} composants, ${n('montre')} montres, ${n('commande')} commandes`);
db.close();
