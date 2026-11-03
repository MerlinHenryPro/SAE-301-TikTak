// Étape 2 : Google renvoie un "code" que l'on échange contre un jeton,
// puis on récupère le profil (sub, email, nom, photo) et on ouvre une session.
import { db } from '../../../../lib/db.js';
import { creerSession } from '../../../../lib/auth.js';

export async function GET({ url, cookies, redirect }) {
  const echec = (m) => redirect('/connexion?erreur=' + encodeURIComponent(m));
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state || state !== cookies.get('google_state')?.value) return echec('Connexion Google annulée ou expirée.');
  const next = cookies.get('google_next')?.value || '/montres';
  cookies.delete('google_state', { path: '/' });
  cookies.delete('google_next', { path: '/' });

  const base = process.env.SITE_URL || url.origin;
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${base}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });
    const token = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(token.error_description || token.error);

    const profilRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const p = await profilRes.json();
    if (!p.sub || !p.email) throw new Error('Profil Google incomplet');

    // Compte existant (par google_id ou e-mail) sinon création
    let u = db.prepare('SELECT * FROM utilisateur WHERE google_id = ? OR email = ?').get(p.sub, p.email.toLowerCase());
    if (u) {
      db.prepare('UPDATE utilisateur SET google_id = ?, avatar = COALESCE(?, avatar) WHERE id_utilisateur = ?')
        .run(p.sub, p.picture ?? null, u.id_utilisateur);
    } else {
      const id = db.prepare('INSERT INTO utilisateur (nom, email, google_id, avatar) VALUES (?, ?, ?, ?)')
        .run(p.name || p.email.split('@')[0], p.email.toLowerCase(), p.sub, p.picture ?? null).lastInsertRowid;
      u = { id_utilisateur: Number(id) };
    }
    creerSession(cookies, u.id_utilisateur);
    return redirect(next);
  } catch (e) {
    console.error('Google OAuth :', e);
    return echec('La connexion avec Google a échoué.');
  }
}
