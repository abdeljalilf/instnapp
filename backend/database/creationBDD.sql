CREATE DATABASE laboratoire;

USE laboratoire;

CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    clientReference VARCHAR(255) NOT NULL,
    dilevery_delay DATE NOT NULL,
    requestingDate DATE NOT NULL
);

CREATE TABLE echantillons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT,
    sampleType VARCHAR(50) NOT NULL,
    samplingLocation VARCHAR(255) NOT NULL,
    samplingDate DATE NOT NULL,
    sampledBy VARCHAR(255) NOT NULL,
    sampleReference VARCHAR(255) NOT NULL,
    sampleSize VARCHAR(255) NOT NULL,
    sampleObservations VARCHAR(255) NOT NULL,
    broughtBy VARCHAR(255) NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE TABLE analyses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    echantillon_id INT,
    analysisType VARCHAR(50) NOT NULL,
    parameter VARCHAR(50) NOT NULL,
    technique VARCHAR(50) NOT NULL,
    validated VARCHAR(50) NOT NULL,
    departement VARCHAR(50) NOT NULL,
    FOREIGN KEY (echantillon_id) REFERENCES echantillons(id)
);

CREATE TABLE elementsdinteret (
    id INT AUTO_INCREMENT PRIMARY KEY,
    elementDinteret VARCHAR(255) NOT NULL,
    analysis_id INT NOT NULL,
    FOREIGN KEY (analysis_id) REFERENCES analyses(id)
);

CREATE TABLE results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    analysis_id INT NOT NULL,
    element VARCHAR(255) NOT NULL,
    mean_value FLOAT NOT NULL,
    incertitude FLOAT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    FOREIGN KEY (analysis_id) REFERENCES analyses(id),
    UNIQUE (analysis_id,element)
);

CREATE TABLE resultats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    elementsdinteret_id INT NOT NULL,
    Unite VARCHAR(50) NOT NULL,
    Valeur_Moyenne VARCHAR(50) NOT NULL,
    Valeur_Limite_OMS INT NOT NULL,
    Limite_Detection INT NOT NULL,
    Observation VARCHAR(200) NOT NULL,
    FOREIGN KEY (elementsdinteret_id) REFERENCES elementsdinteret(id)
);

-- Remplir la table "resultats" avec 30 valeurs
INSERT INTO resultats (elementsdinteret_id, Unite, Valeur_Moyenne, Valeur_Limite_OMS, Limite_Detection, Observation) VALUES
(1, 'mg/L', '5.2', 10, 1, 'Within acceptable range'),
(2, 'mg/L', '7.1', 10, 1, 'Slightly high'),
(3, 'mg/L', '3.5', 10, 1, 'Normal'),
(4, 'mg/L', '6.8', 10, 1, 'Slightly high'),
(5, 'mg/L', '2.3', 10, 1, 'Below average'),
(6, 'mg/L', '5.7', 10, 1, 'Within acceptable range'),
(7, 'mg/L', '8.2', 10, 1, 'Above limit'),
(8, 'mg/L', '4.6', 10, 1, 'Normal'),
(9, 'mg/L', '7.5', 10, 1, 'Slightly high'),
(10, 'mg/L', '5.0', 10, 1, 'Normal'),
(11, 'mg/L', '6.1', 10, 1, 'Within acceptable range'),
(12, 'mg/L', '4.9', 10, 1, 'Normal'),
(13, 'mg/L', '3.8', 10, 1, 'Below average'),
(14, 'mg/L', '6.3', 10, 1, 'Slightly high'),
(15, 'mg/L', '2.9', 10, 1, 'Below average'),
(16, 'mg/L', '5.4', 10, 1, 'Within acceptable range'),
(17, 'mg/L', '7.8', 10, 1, 'Above limit'),
(18, 'mg/L', '4.2', 10, 1, 'Normal'),
(19, 'mg/L', '6.7', 10, 1, 'Slightly high'),
(20, 'mg/L', '3.1', 10, 1, 'Below average'),
(21, 'mg/L', '5.5', 10, 1, 'Within acceptable range'),
(22, 'mg/L', '8.0', 10, 1, 'Above limit'),
(23, 'mg/L', '4.1', 10, 1, 'Normal'),
(24, 'mg/L', '7.2', 10, 1, 'Slightly high'),
(25, 'mg/L', '5.6', 10, 1, 'Within acceptable range'),
(26, 'mg/L', '3.7', 10, 1, 'Below average'),
(27, 'mg/L', '6.5', 10, 1, 'Slightly high'),
(28, 'mg/L', '2.6', 10, 1, 'Below average'),
(29, 'mg/L', '5.9', 10, 1, 'Within acceptable range'),
(30, 'mg/L', '7.9', 10, 1, 'Above limit');