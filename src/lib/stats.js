// Statistiques réelles utilisées pour les nudges (preuve sociale honnête)
import { db } from './db.js';

/** id du composant le plus utilisé pour chaque type */
export function composantsPopulaires() {
  const rows = db.prepare(`
    SELECT c.type, c.id_composant, COUNT(*) AS n
    FROM montre_composant mc JOIN composant c ON c.id_composant = mc.id_composant
    GROUP BY c.id_composant ORDER BY n DESC`).all();
  const res = {};
  for (const r of rows) if (!(r.type in res)) res[r.type] = r.id_composant;
  return res;
}

export const montresCetteSemaine = () =>
  db.prepare("SELECT COUNT(*) n FROM montre WHERE date_creation >= datetime('now', '-7 days')").get().n;

export const totalMontres = () => db.prepare('SELECT COUNT(*) n FROM montre').get().n;
