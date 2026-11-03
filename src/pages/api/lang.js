import { LANGUES } from '../../i18n/index.js';

export function GET({ url, cookies, redirect }) {
  const l = url.searchParams.get('l');
  const r = url.searchParams.get('r') || '/';
  if (LANGUES.includes(l)) cookies.set('lang', l, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  return redirect(r.startsWith('/') && !r.startsWith('//') ? r : '/');
}
