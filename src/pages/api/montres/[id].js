import { enregistrerMontre, supprimerMontre, montreDe, composantsDeMontre } from '../../../lib/montres.js';
import { json, nonConnecte } from '../../../lib/http.js';

export function GET({ params, locals }) {
  if (!locals.user) return nonConnecte();
  const m = montreDe(Number(params.id), locals.user.id_utilisateur);
  if (!m) return json({ erreur: 'Montre introuvable' }, 404);
  return json({ ...m, composants: composantsDeMontre(m.id_montre) });
}

export async function PUT({ params, request, locals }) {
  if (!locals.user) return nonConnecte();
  try {
    const { nom, composants } = await request.json();
    return json(enregistrerMontre(locals.user.id_utilisateur, nom, composants, Number(params.id)));
  } catch (e) {
    return json({ erreur: e.message }, 400);
  }
}

export function DELETE({ params, locals }) {
  if (!locals.user) return nonConnecte();
  try {
    const n = supprimerMontre(Number(params.id), locals.user.id_utilisateur);
    return n ? json({ ok: true }) : json({ erreur: 'Montre introuvable' }, 404);
  } catch (e) {
    return json({ erreur: e.message }, 409);
  }
}
