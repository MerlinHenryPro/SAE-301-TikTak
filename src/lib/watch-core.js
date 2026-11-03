// Logique de rendu de la montre, partagée entre le serveur (seed, sauvegarde)
// et le navigateur (prévisualisation en direct du configurateur).

export const PRIX_BASE = 79; // mouvement + assemblage en France
export const FRAIS_LIVRAISON = 10;

/** Livraison offerte dès 2 montres (nudge « effet du gratuit ») */
export const fraisLivraison = (nbMontres) => (nbMontres >= 2 ? 0 : FRAIS_LIVRAISON);

export const TYPES = ['bracelet', 'cadran', 'boitier_exterieur', 'boitier_interieur'];

// Sélecteurs CSS du SVG fourni, par type de composant
export const SELECTEURS = {
  bracelet: ['.bracelet-haut', '.bracelet-bas', '.bracelet-centre'],
  cadran: ['.boitier-ecran', '.rond-ecran'],
  boitier_exterieur: ['.boitier-exterieur', '.rond-anneau-ext-fond'],
  boitier_interieur: ['.boitier-interieur', '.rond-anneau-int-fond'],
};

/** Couleur de texte lisible sur l'écran (clair ou foncé) */
export function couleurTexteEcran(hex) {
  const h = String(hex).replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.55 ? '#1C1C1C' : '#F4F2EE';
}

/** Prix d'une montre = prix de base + somme des composants */
export function calculerPrix(composants) {
  return PRIX_BASE + composants.reduce((s, c) => s + Number(c.prix || 0), 0);
}

/**
 * Applique une configuration (liste de composants) au texte SVG.
 * Renvoie un SVG autonome (les éléments masqués reçoivent display:none
 * pour fonctionner aussi hors Tailwind).
 */
export function genererSvg(template, composants) {
  let svg = template.replace(/<\?xml[^>]*>\s*/, '').replace(/<!--[\s\S]*?-->/g, '');
  const parType = Object.fromEntries(composants.map((c) => [c.type, c]));
  const forme = parType.cadran?.forme === 'rond' ? 'rond' : 'carre';

  // Bascule carré / rond
  const visible = forme === 'rond' ? 'boitier_rond' : 'boitier';
  const cache = forme === 'rond' ? 'boitier' : 'boitier_rond';
  svg = svg.replace(new RegExp(`<g id="${visible}"\\s+class="hidden"`), `<g id="${visible}"`);
  svg = svg.replace(new RegExp(`<g id="${cache}"\\s+class="hidden"`), `<g id="${cache}" class="hidden" style="display:none"`);

  for (const type of TYPES) {
    const c = parType[type];
    if (!c) continue;
    for (const sel of SELECTEURS[type]) {
      const cls = sel.slice(1);
      svg = svg.replace(
        new RegExp(`(<[a-z]+ class="[^"]*\\b${cls}\\b[^"]*")`, 'g'),
        (m) => `${m} style="fill:${c.couleur}"`
      );
    }
  }
  if (parType.cadran) {
    const t = couleurTexteEcran(parType.cadran.couleur);
    svg = svg.replace(/(<text class="[^"]*\becran-[a-z]+\b[^"]*")/g, (m) => `${m} style="fill:${t}"`);
  }
  // Recadrage sur la montre
  svg = svg.replace(/viewBox="[^"]*"/, 'viewBox="395 30 520 740" role="img"');
  return svg;
}
