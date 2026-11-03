// Étape 1 de l'authentification Google (OAuth 2.0 / OpenID Connect) :
// redirection vers l'écran de consentement Google.
import { randomBytes } from 'node:crypto';

export function GET({ url, cookies, redirect }) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return redirect('/connexion?erreur=' + encodeURIComponent('Connexion Google non configurée.'));

  const state = randomBytes(16).toString('hex');
  const next = url.searchParams.get('next') || '/montres';
  const opts = { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 600 };
  cookies.set('google_state', state, opts);
  cookies.set('google_next', next.startsWith('/') && !next.startsWith('//') ? next : '/montres', opts);

  const base = process.env.SITE_URL || url.origin;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${base}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });
  return redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
