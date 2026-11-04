SELECT nom, prix
FROM montre;

SELECT *
FROM composant
WHERE type = 'bracelet';

SELECT id_montre, nom, prix
FROM montre
ORDER BY prix DESC;

SELECT nom, prix, prix + 10 AS prix_total_livre
FROM montre;

SELECT libelle, type, materiau, prix
FROM composant
WHERE prix BETWEEN 20 AND 100
ORDER BY prix;

SELECT type, ROUND(AVG(prix), 2) AS prix_moyen
FROM composant
GROUP BY type;

SELECT materiau, MIN(prix) AS prix_min, MAX(prix) AS prix_max
FROM composant
GROUP BY materiau
ORDER BY materiau;

SELECT u.nom, COUNT(m.id_montre) AS nb_montres
FROM utilisateur u
LEFT JOIN montre m ON m.id_utilisateur = u.id_utilisateur
GROUP BY u.id_utilisateur
ORDER BY nb_montres DESC;

SELECT u.nom, COUNT(m.id_montre) AS nb_montres
FROM utilisateur u
JOIN montre m ON m.id_utilisateur = u.id_utilisateur
GROUP BY u.id_utilisateur
HAVING COUNT(m.id_montre) >= 3;

SELECT m.nom AS montre, u.nom AS createur
FROM montre m
JOIN utilisateur u ON u.id_utilisateur = m.id_utilisateur;

SELECT m.nom, m.prix, m.date_creation
FROM montre m
JOIN utilisateur u ON u.id_utilisateur = m.id_utilisateur
WHERE u.email = 'camille@demo.fr'
ORDER BY m.date_creation;

SELECT m.nom AS montre, c.type, c.libelle
FROM montre m
JOIN montre_composant mc ON mc.id_montre = m.id_montre
JOIN composant c ON c.id_composant = mc.id_composant
ORDER BY m.id_montre, c.type;

SELECT c.libelle, c.nom_couleur, c.couleur, c.materiau, c.prix
FROM montre_composant mc
JOIN composant c ON c.id_composant = mc.id_composant
WHERE mc.id_montre = 1;

SELECT u.nom AS client, m.nom AS montre, lc.quantite, co.date_commande
FROM commande co
JOIN utilisateur u     ON u.id_utilisateur = co.id_utilisateur
JOIN ligne_commande lc ON lc.id_commande = co.id_commande
JOIN montre m          ON m.id_montre = lc.id_montre
ORDER BY co.date_commande DESC;

SELECT m.nom, COUNT(mc.id_composant) AS nb_composants
FROM montre m
LEFT JOIN montre_composant mc ON mc.id_montre = m.id_montre
GROUP BY m.id_montre;

SELECT u.nom, COUNT(co.id_commande) AS nb_commandes
FROM utilisateur u
LEFT JOIN commande co ON co.id_utilisateur = u.id_utilisateur
GROUP BY u.id_utilisateur
ORDER BY nb_commandes DESC;

SELECT m.nom, COALESCE(SUM(c.prix), 0) AS cout_composants
FROM montre m
LEFT JOIN montre_composant mc ON mc.id_montre = m.id_montre
LEFT JOIN composant c ON c.id_composant = mc.id_composant
GROUP BY m.id_montre;
