import { db } from './db.js';
import { genererSvg, calculerPrix, TYPES, fraisLivraison } from './watch-core.js';
import template from '../assets/montre.svg?raw';

export { template as SVG_TEMPLATE };

export const listerComposants = () =>
  db.prepare('SELECT * FROM composant ORDER BY type, prix, id_composant').all();

export const composantsParIds = (ids) => {
  if (!ids.length) return [];
  return db
    .prepare(`SELECT * FROM composant WHERE id_composant IN (${ids.map(() => '?').join(',')})`)
    .all(...ids);
};

export const composantsDeMontre = (idMontre) =>
  db.prepare(`SELECT c.* FROM montre_composant mc JOIN composant c ON c.id_composant = mc.id_composant
              WHERE mc.id_montre = ? ORDER BY c.type`).all(idMontre);

export const montresUtilisateur = (idUtilisateur) =>
  db.prepare(`SELECT m.*, (SELECT COUNT(*) FROM ligne_commande lc WHERE lc.id_montre = m.id_montre) AS nb_commandes
              FROM montre m WHERE m.id_utilisateur = ?
              ORDER BY COALESCE(m.date_modification, m.date_creation) DESC`).all(idUtilisateur);

export const montreDe = (idMontre, idUtilisateur) =>
  db.prepare('SELECT * FROM montre WHERE id_montre = ? AND id_utilisateur = ?').get(idMontre, idUtilisateur);

/** Valide une configuration : un composant par type, tous existants */
export function validerConfiguration(ids) {
  const composants = composantsParIds([...new Set((ids || []).map(Number).filter(Boolean))]);
  const types = composants.map((c) => c.type);
  if (composants.length !== TYPES.length || TYPES.some((t) => !types.includes(t))) {
    throw new Error('Configuration incomplète : choisissez un composant de chaque type.');
  }
  return composants;
}

export const enregistrerMontre = db.transaction((idUtilisateur, nom, ids, idMontre = null) => {
  const composants = validerConfiguration(ids);
  const prix = calculerPrix(composants);
  const svg = genererSvg(template, composants);
  nom = String(nom || '').trim().slice(0, 60) || 'Ma TiK•TaK';
  if (idMontre) {
    const r = db
      .prepare(`UPDATE montre SET nom = ?, prix = ?, svg = ?, date_modification = datetime('now')
                WHERE id_montre = ? AND id_utilisateur = ?`)
      .run(nom, prix, svg, idMontre, idUtilisateur);
    if (!r.changes) throw new Error('Montre introuvable');
    db.prepare('DELETE FROM montre_composant WHERE id_montre = ?').run(idMontre);
  } else {
    idMontre = db
      .prepare('INSERT INTO montre (id_utilisateur, nom, prix, svg) VALUES (?, ?, ?, ?)')
      .run(idUtilisateur, nom, prix, svg).lastInsertRowid;
  }
  const ins = db.prepare('INSERT INTO montre_composant (id_montre, id_composant) VALUES (?, ?)');
  for (const c of composants) ins.run(idMontre, c.id_composant);
  return { id_montre: Number(idMontre), prix };
});

export function supprimerMontre(idMontre, idUtilisateur) {
  const commandee = db.prepare('SELECT 1 FROM ligne_commande WHERE id_montre = ?').get(idMontre);
  if (commandee) throw new Error('Cette montre a déjà été commandée : elle reste dans votre historique.');
  return db.prepare('DELETE FROM montre WHERE id_montre = ? AND id_utilisateur = ?').run(idMontre, idUtilisateur).changes;
}

export const passerCommande = db.transaction((idUtilisateur, lignes) => {
  if (!lignes?.length) throw new Error('Commande vide');
  const lignesOk = lignes.map(({ id_montre, quantite = 1 }) => {
    const m = montreDe(Number(id_montre), idUtilisateur);
    if (!m) throw new Error('Montre introuvable');
    const q = Math.max(1, Math.min(10, Number(quantite) || 1));
    return { m, q };
  });
  const frais = fraisLivraison(lignesOk.reduce((s, { q }) => s + q, 0));
  const total = frais + lignesOk.reduce((s, { m, q }) => s + m.prix * q, 0);
  const id = db
    .prepare('INSERT INTO commande (id_utilisateur, frais_livraison, total) VALUES (?, ?, ?)')
    .run(idUtilisateur, frais, total).lastInsertRowid;
  const ins = db.prepare(
    'INSERT INTO ligne_commande (id_commande, id_montre, nom_montre, quantite, prix_unitaire) VALUES (?, ?, ?, ?, ?)'
  );
  for (const { m, q } of lignesOk) ins.run(id, m.id_montre, m.nom, q, m.prix);
  return { id_commande: Number(id), total };
});

export function commandesUtilisateur(idUtilisateur) {
  const commandes = db
    .prepare('SELECT * FROM commande WHERE id_utilisateur = ? ORDER BY date_commande DESC')
    .all(idUtilisateur);
  const lignes = db.prepare(`SELECT lc.*, m.svg FROM ligne_commande lc
                             LEFT JOIN montre m ON m.id_montre = lc.id_montre
                             WHERE lc.id_commande = ?`);
  return commandes.map((c) => ({ ...c, lignes: lignes.all(c.id_commande) }));
}
