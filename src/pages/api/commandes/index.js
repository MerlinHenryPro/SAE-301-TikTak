import { passerCommande, commandesUtilisateur } from '../../../lib/montres.js';
import { json, nonConnecte } from '../../../lib/http.js';

export function GET({ locals }) {
  if (!locals.user) return nonConnecte();
  return json(commandesUtilisateur(locals.user.id_utilisateur).map((c) => ({
    ...c, lignes: c.lignes.map(({ svg, ...l }) => l),
  })));
}

export async function POST({ request, locals }) {
  if (!locals.user) return nonConnecte();
  try {
    const { lignes } = await request.json();
    return json(passerCommande(locals.user.id_utilisateur, lignes), 201);
  } catch (e) {
    return json({ erreur: e.message }, 400);
  }
}
