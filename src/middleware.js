import { defineMiddleware } from 'astro:middleware';
import { utilisateurDepuisCookie } from './lib/auth.js';
import { langueDepuisRequete, traducteur } from './i18n/index.js';

const PROTEGEES = [/^\/montres/, /^\/montre\//, /^\/commandes/];

export const onRequest = defineMiddleware(async (ctx, next) => {
  const { request, cookies, url, locals, redirect } = ctx;

  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const hote = request.headers.get('x-forwarded-host') || request.headers.get('host');
    if (origin && new URL(origin).host !== hote) {
      return new Response('Origine refusée', { status: 403 });
    }
  }

  locals.user = utilisateurDepuisCookie(cookies);
  locals.lang = langueDepuisRequete(cookies, request);
  locals.t = traducteur(locals.lang);

  if (!locals.user && PROTEGEES.some((r) => r.test(url.pathname))) {
    return redirect(`/connexion?next=${encodeURIComponent(url.pathname + url.search)}`);
  }
  return next();
});
