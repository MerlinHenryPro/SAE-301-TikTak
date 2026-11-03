// Configuration de la montre en langage naturel via un modèle gratuit d'OpenRouter.
// Si aucune clé n'est configurée (ou si le modèle échoue), un analyseur par
// mots-clés prend le relais pour que la démo fonctionne toujours.
import { listerComposants } from '../../lib/montres.js';
import { TYPES } from '../../lib/watch-core.js';
import { json } from '../../lib/http.js';

const MODELE = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';

export async function POST({ request }) {
  let corps;
  try { corps = await request.json(); } catch { return json({ erreur: 'Requête invalide' }, 400); }
  const message = String(corps.message || '').slice(0, 400);
  const actuelle = corps.selection || {};
  if (!message.trim()) return json({ erreur: 'Message vide' }, 400);

  const composants = listerComposants();
  let resultat = null;
  if (process.env.OPENROUTER_API_KEY) {
    try { resultat = await demanderOpenRouter(message, actuelle, composants); }
    catch (e) { console.error('OpenRouter :', e.message); }
  }
  if (!resultat) resultat = analyseLocale(message, actuelle, composants);

  // Ne garde que des identifiants valides, un par type
  const selection = { ...actuelle };
  for (const type of TYPES) {
    const id = Number(resultat.selection?.[type]);
    if (composants.some((c) => c.id_composant === id && c.type === type)) selection[type] = id;
  }
  return json({ selection, nom: resultat.nom?.slice(0, 60) || null, reponse: resultat.reponse || 'Voici ma proposition.' });
}

async function demanderOpenRouter(message, actuelle, composants) {
  const catalogue = composants
    .map((c) => `${c.id_composant} | ${c.type} | ${c.libelle} | ${c.forme ?? '-'} | ${c.materiau} | ${c.nom_couleur} | ${c.prix} €`)
    .join('\n');
  const systeme = `Tu es le conseiller de la marque de montres françaises TiK•TaK (style raffiné, minimaliste, épuré).
Tu composes une montre à partir du catalogue suivant (id | type | libellé | forme | matériau | couleur | prix) :
${catalogue}

Configuration actuelle (ids) : ${JSON.stringify(actuelle)}
Règles : choisis exactement un id pour chacun des types bracelet, cadran, boitier_exterieur, boitier_interieur.
Garde la configuration actuelle pour ce que l'utilisateur ne mentionne pas.
Réponds UNIQUEMENT avec un objet JSON :
{"selection":{"bracelet":id,"cadran":id,"boitier_exterieur":id,"boitier_interieur":id},"nom":"nom poétique court en français","reponse":"une ou deux phrases chaleureuses qui expliquent ton choix"}`;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.SITE_URL || 'http://localhost:4321',
      'X-Title': 'TiK•TaK',
    },
    body: JSON.stringify({
      model: MODELE,
      temperature: 0.4,
      messages: [
        { role: 'system', content: systeme },
        { role: 'user', content: message },
      ],
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
  const data = await res.json();
  const texte = data.choices?.[0]?.message?.content || '';
  const brut = texte.match(/\{[\s\S]*\}/)?.[0];
  if (!brut) throw new Error('Réponse non JSON');
  return JSON.parse(brut);
}

// ---------- Analyse locale par mots-clés (secours) ----------
const MOTS = {
  couleurs: {
    noir: ['noir', 'black', 'sombre', 'dark', 'minuit'],
    blanc: ['blanc', 'white', 'craie', 'clair'],
    camel: ['camel', 'marron', 'brun', 'tan', 'cognac'],
    bordeaux: ['bordeaux', 'rouge', 'red', 'burgundy'],
    sauge: ['vert', 'sauge', 'green', 'nature', 'forêt', 'foret'],
    bleu: ['bleu', 'blue', 'marine', 'navy', 'océan', 'ocean', 'atlantique'],
    or: ['or', 'doré', 'dore', 'gold', 'rose', 'cuivre'],
    argent: ['argent', 'silver', 'acier', 'steel', 'gris'],
    ivoire: ['ivoire', 'crème', 'creme', 'beige', 'sable'],
    titane: ['titane', 'titanium'],
    ceramique: ['céramique', 'ceramique', 'ceramic'],
  },
};

function analyseLocale(message, actuelle, composants) {
  const m = message.toLowerCase();
  const a = (...mots) => mots.some((x) => new RegExp(`\\b${x}`, 'i').test(m));
  const sel = { ...actuelle };
  const choisir = (type, filtre) => {
    const c = composants.filter((x) => x.type === type).find(filtre);
    if (c) sel[type] = c.id_composant;
  };
  const coul = (c) => Object.entries(MOTS.couleurs).filter(([, mots]) => a(...mots)).map(([k]) => k);
  const voulues = coul();

  // Ambiances
  if (a('sport', 'léger', 'leger', 'running')) choisir('bracelet', (c) => c.materiau === 'Silicone' && (voulues.length ? voulues.some((v) => c.nom_couleur.toLowerCase().includes(v)) : true));
  if (a('mariage', 'élégan', 'elegan', 'chic', 'soirée', 'soiree')) {
    choisir('cadran', (c) => c.forme === 'rond' && c.materiau === 'Verre saphir');
    choisir('bracelet', (c) => c.materiau === 'Cuir' && c.nom_couleur === 'Noir minuit');
  }
  if (a('sobre', 'minimal', 'discr')) {
    choisir('boitier_exterieur', (c) => c.nom_couleur === 'Noir mat');
    choisir('boitier_interieur', (c) => c.nom_couleur === 'Noir');
  }

  // Forme
  const forme = a('rond', 'ronde', 'round', 'classique') ? 'rond' : a('carr', 'square', 'moderne') ? 'carre' : null;

  // Matériaux de bracelet
  const matBracelet = a('cuir', 'leather') ? 'Cuir' : a('milanaise', 'maille') ? 'Acier' : a('silicone', 'caoutchouc') ? 'Silicone' : a('nylon', 'tissu', 'nato') ? 'Nylon' : a('métal', 'metal', 'acier') ? 'Acier' : null;

  const correspond = (c, v) => ({
    noir: /noir/i, blanc: /blanc/i, camel: /camel/i, bordeaux: /bordeaux/i, sauge: /sauge|vert/i, bleu: /bleu/i,
    or: /or rose/i, argent: /argent/i, ivoire: /ivoire|sable|grège|blanc/i, titane: /titane/i, ceramique: /./,
  })[v]?.test(c.nom_couleur) && (v !== 'ceramique' || c.materiau === 'Céramique');

  if (matBracelet || voulues.length) {
    choisir('bracelet', (c) => (!matBracelet || c.materiau === matBracelet) && (!voulues.length || voulues.some((v) => correspond(c, v))));
  }
  if (forme || voulues.length) {
    const f = forme || composants.find((c) => c.id_composant === Number(sel.cadran))?.forme || 'rond';
    choisir('cadran', (c) => c.forme === f && (!voulues.length || voulues.some((v) => correspond(c, v)))) ;
    if (forme && composants.find((c) => c.id_composant === Number(sel.cadran))?.forme !== forme) choisir('cadran', (c) => c.forme === forme);
  }
  const metal = ['or', 'titane', 'ceramique', 'argent', 'noir'].find((v) => voulues.includes(v));
  if (metal) {
    choisir('boitier_exterieur', (c) => correspond(c, metal) && (metal !== 'noir' || c.materiau === 'Acier PVD'));
    choisir('boitier_interieur', (c) => correspond(c, metal) && (metal !== 'noir' || c.materiau === 'Acier PVD'));
  }

  const noms = ['Instant', 'Aube', 'Équinoxe', 'Escale', 'Murmure', 'Horizon', 'Constellation', 'Rivage'];
  return {
    selection: sel,
    nom: noms[Math.floor(Math.random() * noms.length)],
    reponse: 'Voici une proposition fidèle à votre description. Ajustez librement chaque élément ci-dessous.',
  };
}
