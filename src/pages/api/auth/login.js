import { db } from '../../../lib/db.js';
import { creerSession, verifierMotDePasse } from '../../../lib/auth.js';

const sur = (n) => (typeof n === 'string' && n.startsWith('/') && !n.startsWith('//') ? n : '/montres');

export async function POST({ request, cookies, redirect }) {
  const f = await request.formData();
  const email = String(f.get('email') || '').trim().toLowerCase();
  const mdp = String(f.get('mot_de_passe') || '');
  const next = sur(f.get('next'));
  const u = db.prepare('SELECT * FROM utilisateur WHERE email = ?').get(email);
  if (!u || !verifierMotDePasse(mdp, u.mot_de_passe)) {
    return redirect(`/connexion?erreur=${encodeURIComponent('E-mail ou mot de passe incorrect.')}&next=${encodeURIComponent(next)}`);
  }
  creerSession(cookies, u.id_utilisateur);
  return redirect(next);
}
