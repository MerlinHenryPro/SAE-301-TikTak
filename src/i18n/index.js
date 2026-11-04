export const LANGUES = ['fr', 'en'];

const dict = {
  fr: {
    'nav.accueil': 'Accueil',
    'nav.configurer': 'Créer ma montre',
    'nav.montres': 'Mes montres',
    'nav.commandes': 'Mes commandes',
    'nav.connexion': 'Se connecter',
    'nav.deconnexion': 'Se déconnecter',
    'footer.made': 'Conçue et assemblée en France · Besançon',
    'footer.garantie': 'Garantie 2 ans · Retours gratuits 30 jours',
    'home.eyebrow': 'Horlogerie française · Depuis 2026',
    'home.titre': 'Le temps, à votre image.',
    'home.sous': 'Composez votre montre TiK•TaK pièce par pièce, ou décrivez-la simplement : notre assistant la dessine pour vous.',
    'home.cta': 'Composer ma montre',
    'home.cta2': 'Décrire ma montre à l’IA',
    'conf.titre': 'Atelier de création',
    'conf.nom': 'Nom de votre création',
    'conf.enregistrer': 'Enregistrer',
    'conf.commander': 'Commander',
    'conf.total': 'Prix total',
    'conf.ia': 'Assistant TiK•TaK',
    'conf.ia.placeholder': 'Ex. : une montre ronde élégante, bracelet cuir camel et boîtier or rose',
    'conf.ia.envoyer': 'Générer',
    'montres.titre': 'Mes montres',
    'montres.vide': 'Vous n’avez pas encore créé de montre.',
    'commandes.titre': 'Mes commandes',
    'commandes.vide': 'Aucune commande pour le moment.',
    'auth.titre': 'Votre espace TiK•TaK',
    'auth.google': 'Continuer avec Google',
    'auth.connexion': 'Connexion',
    'auth.inscription': 'Créer un compte',
    'commun.modifier': 'Modifier',
    'commun.supprimer': 'Supprimer',
    'commun.voir': 'Voir',
  },
  en: {
    'nav.accueil': 'Home',
    'nav.configurer': 'Create my watch',
    'nav.montres': 'My watches',
    'nav.commandes': 'My orders',
    'nav.connexion': 'Sign in',
    'nav.deconnexion': 'Sign out',
    'footer.made': 'Designed and assembled in France · Besançon',
    'footer.garantie': '2-year warranty · Free 30-day returns',
    'home.eyebrow': 'French watchmaking · Since 2026',
    'home.titre': 'Time, made yours.',
    'home.sous': 'Build your TiK•TaK watch piece by piece, or simply describe it: our assistant draws it for you.',
    'home.cta': 'Build my watch',
    'home.cta2': 'Describe it to the AI',
    'conf.titre': 'Design studio',
    'conf.nom': 'Name your creation',
    'conf.enregistrer': 'Save',
    'conf.commander': 'Order',
    'conf.total': 'Total price',
    'conf.ia': 'TiK•TaK assistant',
    'conf.ia.placeholder': 'E.g. an elegant round watch, tan leather strap and rose gold case',
    'conf.ia.envoyer': 'Generate',
    'montres.titre': 'My watches',
    'montres.vide': 'You have not created a watch yet.',
    'commandes.titre': 'My orders',
    'commandes.vide': 'No orders yet.',
    'auth.titre': 'Your TiK•TaK space',
    'auth.google': 'Continue with Google',
    'auth.connexion': 'Sign in',
    'auth.inscription': 'Create an account',
    'commun.modifier': 'Edit',
    'commun.supprimer': 'Delete',
    'commun.voir': 'View',
  },
};

export function langueDepuisRequete(cookies, request) {
  const c = cookies.get('lang')?.value;
  if (LANGUES.includes(c)) return c;
  const accept = request.headers.get('accept-language') || '';
  return accept.toLowerCase().startsWith('en') ? 'en' : 'fr';
}

export const traducteur = (lang) => (cle) => dict[lang]?.[cle] ?? dict.fr[cle] ?? cle;

export const formatPrix = (prix, lang = 'fr') =>
  new Intl.NumberFormat(lang === 'en' ? 'en-GB' : 'fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(prix);

export const formatDate = (iso, lang = 'fr') =>
  new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'fr-FR', { dateStyle: 'long' }).format(new Date(iso.replace(' ', 'T') + (iso.includes('Z') ? '' : 'Z')));
