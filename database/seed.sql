-- =========================================================
--  TiK•TaK — Jeu de données
-- =========================================================
-- Mot de passe des comptes de démo : tiktak2026
INSERT INTO utilisateur (nom, email, mot_de_passe, date_inscription) VALUES
 ('Camille Durand', 'camille@demo.fr', 'scrypt$c3f1a7e0b9d24e11$PLACEHOLDER', '2026-10-01 09:12:00'),
 ('Léo Martin',     'leo@demo.fr',     'scrypt$c3f1a7e0b9d24e11$PLACEHOLDER', '2026-10-05 14:30:00'),
 ('Inès Bernard',   'ines@demo.fr',    'scrypt$c3f1a7e0b9d24e11$PLACEHOLDER', '2026-10-12 18:45:00'),
 ('Hugo Petit',     'hugo@demo.fr',    'scrypt$c3f1a7e0b9d24e11$PLACEHOLDER', '2026-10-20 11:00:00');

-- Bracelets
INSERT INTO composant (type, libelle, forme, materiau, couleur, nom_couleur, prix) VALUES
 ('bracelet','Bracelet cuir noir',          NULL,'Cuir','#1C1C1C','Noir minuit',     45),
 ('bracelet','Bracelet cuir camel',         NULL,'Cuir','#B07A4A','Camel',           45),
 ('bracelet','Bracelet cuir bordeaux',      NULL,'Cuir','#5E1F2B','Bordeaux',        49),
 ('bracelet','Bracelet silicone blanc',     NULL,'Silicone','#F2EFEA','Blanc craie', 19),
 ('bracelet','Bracelet silicone sauge',     NULL,'Silicone','#9CAF88','Vert sauge',  19),
 ('bracelet','Bracelet silicone bleu nuit', NULL,'Silicone','#1F2A44','Bleu nuit',   19),
 ('bracelet','Bracelet acier brossé',       NULL,'Acier','#B8BCC2','Argent',         89),
 ('bracelet','Bracelet maille milanaise',   NULL,'Acier','#C9A27E','Or rose',       119),
 ('bracelet','Bracelet nylon sable',        NULL,'Nylon','#D8C8AE','Sable',          25);

-- Cadrans (forme + couleur de l'écran)
INSERT INTO composant (type, libelle, forme, materiau, couleur, nom_couleur, prix) VALUES
 ('cadran','Cadran carré noir',     'carre','Verre minéral','#111111','Noir profond', 35),
 ('cadran','Cadran carré ivoire',   'carre','Verre minéral','#EDE6D8','Ivoire',       35),
 ('cadran','Cadran carré saphir',   'carre','Verre saphir', '#16233B','Bleu saphir', 120),
 ('cadran','Cadran rond noir',      'rond', 'Verre minéral','#111111','Noir profond', 39),
 ('cadran','Cadran rond ivoire',    'rond', 'Verre minéral','#EDE6D8','Ivoire',       39),
 ('cadran','Cadran rond saphir',    'rond', 'Verre saphir', '#16233B','Bleu saphir', 129),
 ('cadran','Cadran rond vert forêt','rond', 'Verre saphir', '#1F3B2D','Vert forêt',  129);

-- Boîtiers extérieurs
INSERT INTO composant (type, libelle, forme, materiau, couleur, nom_couleur, prix) VALUES
 ('boitier_exterieur','Boîtier ext. acier',        NULL,'Acier inoxydable','#C7CBD1','Argent',     60),
 ('boitier_exterieur','Boîtier ext. acier noir',   NULL,'Acier PVD',       '#2B2B2E','Noir mat',   75),
 ('boitier_exterieur','Boîtier ext. titane',       NULL,'Titane',          '#8E9196','Gris titane',140),
 ('boitier_exterieur','Boîtier ext. or rose',      NULL,'Acier doré',      '#C9A27E','Or rose',    95),
 ('boitier_exterieur','Boîtier ext. céramique',    NULL,'Céramique',       '#F4F2EE','Blanc',     160);

-- Boîtiers intérieurs
INSERT INTO composant (type, libelle, forme, materiau, couleur, nom_couleur, prix) VALUES
 ('boitier_interieur','Boîtier int. acier',        NULL,'Acier inoxydable','#9EA3AA','Argent',     30),
 ('boitier_interieur','Boîtier int. noir',         NULL,'Acier PVD',       '#151517','Noir',       35),
 ('boitier_interieur','Boîtier int. titane',       NULL,'Titane',          '#6E7177','Gris titane', 70),
 ('boitier_interieur','Boîtier int. or rose',      NULL,'Acier doré',      '#B08463','Or rose',     45),
 ('boitier_interieur','Boîtier int. céramique',    NULL,'Céramique',       '#D9D5CE','Grège',       80);

-- Montres (prix = prix de base 79 € + composants)
INSERT INTO montre (id_utilisateur, nom, prix, date_creation) VALUES
 (1,'Minuit parisien', 0,'2026-10-02 10:00:00'),
 (1,'Sauge du dimanche',0,'2026-10-03 16:20:00'),
 (1,'Or du soir',     0,'2026-10-08 21:05:00'),
 (2,'Titane brut',    0,'2026-10-06 08:40:00'),
 (2,'Bleu Atlantique',0,'2026-10-15 12:10:00'),
 (3,'Ivoire',         0,'2026-10-13 19:00:00'),
 (1,'Brouillon',      79,'2026-10-25 09:00:00');   -- montre sans composant

INSERT INTO montre_composant (id_montre, id_composant) VALUES
 (1,1),(1,10),(1,18),(1,23),
 (2,5),(2,14),(2,17),(2,22),
 (3,8),(3,15),(3,20),(3,25),
 (4,7),(4,13),(4,19),(4,24),
 (5,6),(5,12),(5,17),(5,22),
 (6,4),(6,11),(6,21),(6,26);

UPDATE montre SET prix = 79 + COALESCE((
  SELECT SUM(c.prix) FROM montre_composant mc JOIN composant c ON c.id_composant = mc.id_composant
  WHERE mc.id_montre = montre.id_montre), 0);

INSERT INTO commande (id_utilisateur, date_commande, statut, total) VALUES
 (1,'2026-10-04 11:00:00','livree',  0),
 (1,'2026-10-10 15:30:00','expediee',0),
 (2,'2026-10-16 09:45:00','validee', 0);

INSERT INTO ligne_commande (id_commande, id_montre, nom_montre, quantite, prix_unitaire)
SELECT 1, id_montre, nom, 1, prix FROM montre WHERE id_montre = 1 UNION ALL
SELECT 2, id_montre, nom, 1, prix FROM montre WHERE id_montre = 3 UNION ALL
SELECT 2, id_montre, nom, 2, prix FROM montre WHERE id_montre = 2 UNION ALL
SELECT 3, id_montre, nom, 1, prix FROM montre WHERE id_montre = 5;

UPDATE commande SET frais_livraison = CASE WHEN (SELECT SUM(quantite) FROM ligne_commande lc WHERE lc.id_commande = commande.id_commande) >= 2 THEN 0 ELSE 10 END;
UPDATE commande SET total = frais_livraison + (
  SELECT SUM(quantite * prix_unitaire) FROM ligne_commande lc WHERE lc.id_commande = commande.id_commande);
