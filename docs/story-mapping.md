# TiK•TaK : story mapping (parcours utilisateur)

**Persona** : Léa, 31 ans, cheffe de projet à Lyon. Elle cherche une montre élégante qui lui ressemble, ou un cadeau unique. Elle achète surtout sur mobile, compare beaucoup, et se méfie des sites trop chargés.

## Activités → étapes → tâches

| Activité | 1. Découvrir | 2. S'inspirer | 3. Composer | 4. Sauvegarder | 5. Commander | 6. Suivre |
|---|---|---|---|---|---|---|
| **Étapes** | Arrive sur l'accueil | Parcourt les créations du moment | Configure sa montre | Crée un compte et enregistre | Valide son achat | Retrouve montres et commandes |
| **MVP (release 1)** | Voir la promesse de la marque (hero) | Voir 3 modèles « vitrine » | Choisir la forme du cadran (rond/carré) | Se connecter avec Google | Choisir la quantité | Voir la liste « Mes montres » |
| | Comprendre le prix « dès 79 € » | Ouvrir un modèle dans le configurateur | Choisir boîtier extérieur, boîtier intérieur, bracelet | Créer un compte par e-mail | Voir le total avec livraison | Voir l'historique des commandes |
| | | | Voir l'aperçu SVG en direct | Nommer sa création | Confirmer la commande | Modifier une montre |
| | | | Voir le prix total se mettre à jour | Enregistrer plusieurs modèles | | Supprimer une montre |
| **Release 2** | Changer de langue (FR/EN) | | Décrire sa montre à l'IA (chat) | Retrouver sa création après connexion | | Voir une montre seule (page produit) |
| | | | Suggestions de demandes rapides | | | Statut de la commande |
| **Plus tard** | Avis clients | Filtrer les inspirations | Gravure personnalisée | Partager sa création | Paiement réel (Stripe) | Suivi de livraison |

## Parcours principal (« happy path »)
1. Accueil → bouton « Composer ma montre ».
2. Configurateur : la configuration « Signature » est déjà choisie, Léa change le cadran pour un rond saphir et le bracelet pour du cuir bordeaux. L'aperçu et le prix changent en direct.
3. Elle clique sur « Enregistrer » : comme elle n'est pas connectée, elle est envoyée sur la page de connexion, se connecte avec Google, puis revient sur sa création intacte.
4. Elle clique sur « Commander » : la page produit s'ouvre avec le récapitulatif, elle confirme.
5. Elle arrive sur « Mes commandes » avec un message de confirmation.
