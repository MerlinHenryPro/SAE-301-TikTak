import { enregistrerMontre, montresUtilisateur } from '../../../lib/montres.js';
import { json, nonConnecte } from '../../../lib/http.js';

export function GET({ locals }) {
  if (!locals.user) return nonConnecte();
  return json(montresUtilisateur(locals.user.id_utilisateur).map(({ svg, ...m }) => m));
}

export async function POST({ request, locals }) {
  if (!locals.user) return nonConnecte();
  try {
    const { nom, composants } = await request.json();
    return json(enregistrerMontre(locals.user.id_utilisateur, nom, composants), 201);
  } catch (e) {
    return json({ erreur: e.message }, 400);
  }
}
