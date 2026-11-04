PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS ligne_commande;
DROP TABLE IF EXISTS commande;
DROP TABLE IF EXISTS montre_composant;
DROP TABLE IF EXISTS montre;
DROP TABLE IF EXISTS composant;
DROP TABLE IF EXISTS session;
DROP TABLE IF EXISTS utilisateur;

CREATE TABLE utilisateur (
  id_utilisateur   INTEGER PRIMARY KEY AUTOINCREMENT,
  nom              TEXT    NOT NULL,
  email            TEXT    NOT NULL UNIQUE,
  mot_de_passe     TEXT,                 -- hash scrypt, NULL si compte Google
  google_id        TEXT    UNIQUE,       -- "sub" Google, NULL si compte local
  avatar           TEXT,
  date_inscription TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE session (
  id_session      TEXT    PRIMARY KEY,
  id_utilisateur  INTEGER NOT NULL REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
  date_expiration TEXT    NOT NULL
);

CREATE TABLE composant (
  id_composant INTEGER PRIMARY KEY AUTOINCREMENT,
  type         TEXT    NOT NULL CHECK (type IN ('bracelet','cadran','boitier_exterieur','boitier_interieur')),
  libelle      TEXT    NOT NULL,
  forme        TEXT    CHECK (forme IN ('rond','carre')),  -- utilisé pour le cadran
  materiau     TEXT    NOT NULL,
  couleur      TEXT    NOT NULL,       -- code hexadécimal, ex. #1C1C1C
  nom_couleur  TEXT    NOT NULL,       -- ex. "Noir minuit"
  prix         REAL    NOT NULL CHECK (prix >= 0)
);

CREATE TABLE montre (
  id_montre         INTEGER PRIMARY KEY AUTOINCREMENT,
  id_utilisateur    INTEGER NOT NULL REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
  nom               TEXT    NOT NULL,
  prix              REAL    NOT NULL CHECK (prix >= 0),
  svg               TEXT,                 -- rendu SVG de la montre
  date_creation     TEXT    NOT NULL DEFAULT (datetime('now')),
  date_modification TEXT
);

CREATE TABLE montre_composant (
  id_montre    INTEGER NOT NULL REFERENCES montre(id_montre) ON DELETE CASCADE,
  id_composant INTEGER NOT NULL REFERENCES composant(id_composant) ON DELETE RESTRICT,
  PRIMARY KEY (id_montre, id_composant)
);

CREATE TABLE commande (
  id_commande    INTEGER PRIMARY KEY AUTOINCREMENT,
  id_utilisateur INTEGER NOT NULL REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
  date_commande  TEXT    NOT NULL DEFAULT (datetime('now')),
  statut         TEXT    NOT NULL DEFAULT 'validee' CHECK (statut IN ('validee','expediee','livree','annulee')),
  frais_livraison REAL   NOT NULL DEFAULT 10,
  total          REAL    NOT NULL
);

CREATE TABLE ligne_commande (
  id_commande   INTEGER NOT NULL REFERENCES commande(id_commande) ON DELETE CASCADE,
  id_montre     INTEGER NOT NULL REFERENCES montre(id_montre) ON DELETE RESTRICT,
  nom_montre    TEXT    NOT NULL,
  quantite      INTEGER NOT NULL DEFAULT 1 CHECK (quantite > 0),
  prix_unitaire REAL    NOT NULL,
  PRIMARY KEY (id_commande, id_montre)
);

CREATE INDEX idx_montre_utilisateur   ON montre(id_utilisateur);
CREATE INDEX idx_commande_utilisateur ON commande(id_utilisateur);
CREATE INDEX idx_composant_type       ON composant(type);
