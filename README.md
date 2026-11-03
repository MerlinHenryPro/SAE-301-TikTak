# TiK•TaK : configurateur de montres personnalisées

SAE 301 « Concevoir et développer une expérience utilisateur ».
Site de la marque française TiK•TaK : on compose sa montre (cadran rond ou carré, boîtiers, bracelet), on l'enregistre, on la modifie et on la commande. Une IA (OpenRouter) peut aussi composer la montre à partir d'une phrase.

## 🔗 Liens de rendu

| | |
|---|---|
| **URL du site** | https://A-COMPLETER (ou http://A-COMPLETER si le certificat n'est pas en place) |
| **Chemin de la base sur le VPS** | `/var/www/tiktak/data/tiktak.sqlite` |
| **Maquette Figma** | A-COMPLETER |
| **Compte de démonstration** | `camille@demo.fr` / `tiktak2026` |

## Stack

- **Astro 7** en mode serveur (adaptateur Node), installé avec **bun**
- **Tailwind CSS 4 + DaisyUI 5** avec un thème personnalisé `tiktak` (clair) et `tiktak-nuit` (sombre), dans `src/styles/global.css`
- **SQLite** (better-sqlite3)
- **Authentification** : Google (OAuth 2.0 / OpenID Connect) + compte e-mail/mot de passe (hash scrypt), sessions en base
- **IA** : modèle gratuit OpenRouter (`OPENROUTER_MODEL`), avec un mode de secours par mots-clés
- **Bonus** : interface de chat pour reconfigurer la montre, internationalisation FR/EN

## Lancer en local

```bash
bun install
cp .env.example .env        # puis compléter si besoin
bun run db:init             # crée data/tiktak.sqlite (schéma + données de démo)
bun run dev                 # http://localhost:4321
```

Autres commandes : `bun run build`, `bun run start` (serveur de production), `bun run db:queries` (exécute les 17 requêtes SQL).

## Structure

```
src/
  assets/montre.svg          SVG fourni (sélecteurs .bracelet-haut, .boitier-exterieur, ...)
  components/                Logo, Montre, MontreCard (entité MONTRE), ComposantOption (entité COMPOSANT)
  layouts/Layout.astro       En-tête, navigation, pied de page, balises SEO
  lib/
    watch-core.js            Rendu du SVG (couleurs, bascule carré/rond), calcul du prix
    montres.js               Accès aux données : montres, composants, commandes
    auth.js                  Sessions, hash des mots de passe
  pages/
    index.astro              Accueil
    configurateur.astro      Configurateur + aperçu SVG en direct + chat IA
    connexion.astro          Connexion / création de compte (Google ou e-mail)
    montres/index.astro      Mes montres (voir, modifier, supprimer)
    montre/[id].astro        Page d'une montre + commande
    commandes.astro          Historique des commandes
    api/                     Routes REST (montres, commandes, ia, auth, lang)
  i18n/                      Traductions FR/EN
database/
  schema.sql                 MPD (CREATE TABLE)
  seed.sql                   Données de démonstration
  requetes.sql               Les 17 requêtes demandées
  tiktak.sqlite              Base de données rendue
docs/                        MCD/MPD, story mapping, résultats des requêtes, document MKG
deploy/                      Service systemd, configuration Nginx
.github/workflows/deploy.yml Déploiement automatique sur le VPS
```

## API

| Méthode | Route | Rôle |
|---|---|---|
| GET / POST | `/api/montres` | Lister / créer une montre `{ nom, composants: [id, ...] }` |
| GET / PUT / DELETE | `/api/montres/:id` | Lire / modifier / supprimer |
| GET / POST | `/api/commandes` | Historique / passer une commande `{ lignes: [{ id_montre, quantite }] }` |
| POST | `/api/ia` | `{ message, selection }` → nouvelle configuration proposée par l'IA |
| GET | `/api/auth/google` | Connexion Google |
| POST | `/api/auth/login`, `/api/auth/register`, `/api/auth/logout` | Compte e-mail |

## Déploiement sur le VPS

```bash
# 1. Prérequis (Ubuntu/Debian)
sudo apt update && sudo apt install -y nginx git curl build-essential
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs
curl -fsSL https://bun.sh/install | bash && source ~/.bashrc

# 2. Code
sudo mkdir -p /var/www/tiktak && sudo chown $USER:www-data /var/www/tiktak
git clone https://github.com/<vous>/tiktak.git /var/www/tiktak
cd /var/www/tiktak
cp .env.example .env && nano .env            # SITE_URL, DATABASE_PATH=/var/www/tiktak/data/tiktak.sqlite, clés Google et OpenRouter
bun install && bun run build

# 3. Base de données : copie de la base rendue
mkdir -p data && cp database/tiktak.sqlite data/tiktak.sqlite
sudo chown -R www-data:www-data data && sudo chmod 775 data

# 4. Service systemd (redémarrage automatique au reboot)
sudo cp deploy/tiktak.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now tiktak

# 5. Nginx + HTTPS
sudo cp deploy/nginx-tiktak.conf /etc/nginx/sites-available/tiktak   # remplacer le domaine
sudo ln -s /etc/nginx/sites-available/tiktak /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo ufw allow 'Nginx Full'
sudo apt install -y certbot python3-certbot-nginx && sudo certbot --nginx -d votre-domaine.fr
```

### Déploiement automatique (GitHub Actions)
À chaque push sur `main`, `.github/workflows/deploy.yml` compile le projet puis se connecte en SSH au VPS pour faire `git pull`, `bun install`, `bun run build` et `systemctl restart tiktak`.
Secrets à créer dans le dépôt : `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`.
L'utilisateur SSH doit pouvoir lancer `sudo systemctl restart tiktak` sans mot de passe :
```bash
echo "$USER ALL=NOPASSWD: /bin/systemctl restart tiktak" | sudo tee /etc/sudoers.d/tiktak
```

### Google OAuth
Dans Google Cloud Console > API et services > Identifiants, créer un « ID client OAuth » (application Web), avec :
- Origine JavaScript autorisée : `https://votre-domaine.fr`
- URI de redirection autorisée : `https://votre-domaine.fr/api/auth/google/callback` (et `http://localhost:4321/api/auth/google/callback` pour le local)

## Référencement (SEO)
Balises `title`, `description`, `canonical`, Open Graph, Twitter Card, `lang`, données structurées JSON-LD (Organization), `robots.txt`, `noindex` sur les pages privées (compte, montres, commandes).
