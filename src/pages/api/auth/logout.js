import { detruireSession } from '../../../lib/auth.js';

export function POST({ cookies, redirect }) {
  detruireSession(cookies);
  return redirect('/');
}
