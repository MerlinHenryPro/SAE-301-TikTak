import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { db } from './db.js';

export const COOKIE = 'tiktak_session';
const DUREE_JOURS = 30;

export function hasherMotDePasse(mdp) {
  const sel = randomBytes(16).toString('hex');
  const hash = scryptSync(mdp, sel, 64).toString('hex');
  return `scrypt$${sel}$${hash}`;
}

export function verifierMotDePasse(mdp, stocke) {
  if (!stocke) return false;
  const [algo, sel, hash] = stocke.split('$');
  if (algo !== 'scrypt' || !hash) return false;
  const calcule = scryptSync(mdp, sel, 64);
  const attendu = Buffer.from(hash, 'hex');
  return attendu.length === calcule.length && timingSafeEqual(attendu, calcule);
}

export function creerSession(cookies, idUtilisateur) {
  const id = randomBytes(32).toString('hex');
  const exp = new Date(Date.now() + DUREE_JOURS * 864e5);
  db.prepare('INSERT INTO session (id_session, id_utilisateur, date_expiration) VALUES (?, ?, ?)')
    .run(id, idUtilisateur, exp.toISOString());
  cookies.set(COOKIE, id, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    expires: exp,
    secure: (process.env.SITE_URL || '').startsWith('https://'),
  });
}

export function utilisateurDepuisCookie(cookies) {
  const id = cookies.get(COOKIE)?.value;
  if (!id) return null;
  const u = db.prepare(`
    SELECT u.id_utilisateur, u.nom, u.email, u.avatar, s.date_expiration
    FROM session s JOIN utilisateur u ON u.id_utilisateur = s.id_utilisateur
    WHERE s.id_session = ?`).get(id);
  if (!u || new Date(u.date_expiration) < new Date()) return null;
  return u;
}

export function detruireSession(cookies) {
  const id = cookies.get(COOKIE)?.value;
  if (id) db.prepare('DELETE FROM session WHERE id_session = ?').run(id);
  cookies.delete(COOKIE, { path: '/' });
}
