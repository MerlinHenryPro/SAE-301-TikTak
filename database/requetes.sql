-- =========================================================
--  TiK•TaK — Requêtes SQL demandées (Partie BackEnd)
--  À exécuter dans DataGrip sur data/tiktak.sqlite
--  ou : bun run db:queries
-- =========================================================

-- 1. Liste de toutes les montres enregistrées avec leur nom et leur prix
SELECT nom, prix
FROM montre;

-- 2. Tous les composants de type « bracelet »
SELECT *
FROM composant
WHERE type = 'bracelet';

-- 3. Toutes les montres classées de la plus chère à la moins chère
SELECT id_montre, nom, prix
FROM montre
ORDER BY prix DESC;

-- 4. Prix total de chaque montre en ajoutant 10 € de frais de livraison
SELECT nom, prix, prix + 10 AS prix_total_livre
FROM montre;

-- 5. Composants dont le prix est compris entre 20 € et 100 €
SELECT libelle, type, materiau, prix
FROM composant
WHERE prix BETWEEN 20 AND 100
ORDER BY prix;

-- 6. Prix moyen des composants pour chaque type
SELECT type, ROUND(AVG(prix), 2) AS prix_moyen
FROM composant
GROUP BY type;

-- 7. Prix minimum et maximum des composants pour chaque matériau
SELECT materiau, MIN(prix) AS prix_min, MAX(prix) AS prix_max
FROM composant
GROUP BY materiau
ORDER BY materiau;

-- 8. Nombre de montres créées par chaque utilisateur
SELECT u.nom, COUNT(m.id_montre) AS nb_montres
FROM utilisateur u
LEFT JOIN montre m ON m.id_utilisateur = u.id_utilisateur
GROUP BY u.id_utilisateur
ORDER BY nb_montres DESC;

-- 9. Utilisateurs ayant créé au moins 3 montres personnalisées
SELECT u.nom, COUNT(m.id_montre) AS nb_montres
FROM utilisateur u
JOIN montre m ON m.id_utilisateur = u.id_utilisateur
GROUP BY u.id_utilisateur
HAVING COUNT(m.id_montre) >= 3;

-- 10. Nom de chaque montre et nom de l'utilisateur qui l'a créée
SELECT m.nom AS montre, u.nom AS createur
FROM montre m
JOIN utilisateur u ON u.id_utilisateur = m.id_utilisateur;

-- 11. Montres enregistrées par un utilisateur précis, avec prix et date de création
SELECT m.nom, m.prix, m.date_creation
FROM montre m
JOIN utilisateur u ON u.id_utilisateur = m.id_utilisateur
WHERE u.email = 'camille@demo.fr'
ORDER BY m.date_creation;

-- 12. Liste de tous les composants utilisés dans chaque montre personnalisée
SELECT m.nom AS montre, c.type, c.libelle
FROM montre m
JOIN montre_composant mc ON mc.id_montre = m.id_montre
JOIN composant c ON c.id_composant = mc.id_composant
ORDER BY m.id_montre, c.type;

-- 13. Nom, couleur, matériau et prix des composants d'une montre précise
SELECT c.libelle, c.nom_couleur, c.couleur, c.materiau, c.prix
FROM montre_composant mc
JOIN composant c ON c.id_composant = mc.id_composant
WHERE mc.id_montre = 1;

-- 14. Historique des commandes : utilisateur, montre commandée, date
SELECT u.nom AS client, m.nom AS montre, lc.quantite, co.date_commande
FROM commande co
JOIN utilisateur u     ON u.id_utilisateur = co.id_utilisateur
JOIN ligne_commande lc ON lc.id_commande = co.id_commande
JOIN montre m          ON m.id_montre = lc.id_montre
ORDER BY co.date_commande DESC;

-- 15. Nombre de composants de chaque montre, y compris les montres sans composant
SELECT m.nom, COUNT(mc.id_composant) AS nb_composants
FROM montre m
LEFT JOIN montre_composant mc ON mc.id_montre = m.id_montre
GROUP BY m.id_montre;

-- 16. Nombre de commandes par utilisateur, y compris ceux qui n'ont jamais commandé
SELECT u.nom, COUNT(co.id_commande) AS nb_commandes
FROM utilisateur u
LEFT JOIN commande co ON co.id_utilisateur = u.id_utilisateur
GROUP BY u.id_utilisateur
ORDER BY nb_commandes DESC;

-- 17. Coût total des composants pour chaque montre personnalisée
SELECT m.nom, COALESCE(SUM(c.prix), 0) AS cout_composants
FROM montre m
LEFT JOIN montre_composant mc ON mc.id_montre = m.id_montre
LEFT JOIN composant c ON c.id_composant = mc.id_composant
GROUP BY m.id_montre;
