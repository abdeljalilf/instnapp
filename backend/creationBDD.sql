CREATE DATABASE laboratoire;

USE laboratoire;

CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL
);

CREATE TABLE echantillons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT,
    sampleType VARCHAR(50) NOT NULL,
    samplingLocation VARCHAR(255) NOT NULL,
    samplingDate DATE NOT NULL,
    sampledBy VARCHAR(255) NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE TABLE analyses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    echantillon_id INT,
    analysisType VARCHAR(50) NOT NULL,
    parameter VARCHAR(50) NOT NULL,
    technique VARCHAR(50) NOT NULL,
    FOREIGN KEY (echantillon_id) REFERENCES echantillons(id)
);
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('reception', 'admin') NOT NULL
);

ALTER TABLE clients ADD validated BOOLEAN DEFAULT FALSE;

ALTER TABLE clients DROP COLUMN validated;

ALTER TABLE clients ADD COLUMN clientReference VARCHAR(50);
ALTER TABLE echantillons ADD COLUMN sampleReference VARCHAR(50);



-- 1. Renommer la colonne 'echantillon_id' en 'analysis_id'
ALTER TABLE elementsdinteret CHANGE COLUMN echantillon_id analysis_id INT;

-- 2. Si nécessaire, mettre à jour les valeurs de 'analysis_id' pour s'assurer qu'elles sont correctes
-- Vous devrez peut-être ajuster cette partie selon vos besoins spécifiques
-- Par exemple, si vous avez une logique pour mapper les anciens 'echantillon_id' aux nouveaux 'analysis_id'

-- 3. Mettre à jour la contrainte de clé étrangère
-- D'abord, il faut supprimer la contrainte existante (si elle existe)
ALTER TABLE elementsdinteret DROP FOREIGN KEY IF EXISTS fk_elementsdinteret_echantillon;

-- Ensuite, ajouter la nouvelle contrainte
ALTER TABLE elementsdinteret 
ADD CONSTRAINT fk_elementsdinteret_analysis
FOREIGN KEY (analysis_id) REFERENCES analyses(id);

DROP TABLE IF EXISTS elementsdinteret;

CREATE TABLE elementsdinteret (
    id INT AUTO_INCREMENT PRIMARY KEY,
    elementDinteret VARCHAR(255) NOT NULL,
    analysis_id INT NOT NULL,
    FOREIGN KEY (analysis_id) REFERENCES analyses(id)
);

ALTER TABLE clients ADD COLUMN delais_livraison DATE NOT NULL;

-- Étape 1: Supprimer la colonne existante
ALTER TABLE clients DROP COLUMN delais_livraison;

-- Étape 2: Ajouter la colonne avec une valeur par défaut fixée à la date d'aujourd'hui
-- Note : `DEFAULT '2024-07-22'` devrait être remplacé par la date actuelle

ALTER TABLE clients 
ADD COLUMN delais_livraison DATE DEFAULT '2024-07-22';
