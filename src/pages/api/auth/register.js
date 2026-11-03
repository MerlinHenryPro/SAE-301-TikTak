import { db } from '../../../lib/db.js';
import { creerSession, hasherMotDePasse } from '../../../lib/auth.js';

const sur = (n) => (typeof n === 'string' && n.startsWith('/') && !n.startsWith('//') ? n : '/montres');

export async function POST({ request, cookies, redirect }) {
  const f = await request.formData();
  const nom = String(f.get('nom') || '').trim().slice(0, 80);
  const email = String(f.get('email') || '').trim().toLowerCase();
  const mdp = String(f.get('mot_de_passe') || '');
  const next = sur(f.get('next'));
  const erreur = (m) => redirect(`/connexion?onglet=inscription&erreur=${encodeURIComponent(m)}&next=${encodeURIComponent(next)}`);

  if (!nom || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return erreur('Merci de renseigner un nom et un e-mail valides.');
  if (mdp.length < 8) return erreur('Le mot de passe doit contenir au moins 8 caractères.');
  if (db.prepare('SELECT 1 FROM utilisateur WHERE email = ?').get(email)) return erreur('Un compte existe déjà avec cet e-mail.');

  const id = db.prepare('INSERT INTO utilisateur (nom, email, mot_de_passe) VALUES (?, ?, ?)')
    .run(nom, email, hasherMotDePasse(mdp)).lastInsertRowid;
  creerSession(cookies, Number(id));
  return redirect(next);
}
