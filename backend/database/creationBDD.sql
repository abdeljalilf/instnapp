CREATE DATABASE laboratoire;

USE laboratoire;

CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    clientReference VARCHAR(255),
    ref_client_ATN VARCHAR(255),
    dilevery_delay DATE NOT NULL,
    requestingDate DATE NOT NULL
);
ALTER TABLE clients ADD ref_client_ATN VARCHAR(155);

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
    validated VARCHAR(50) DEFAULT 'reception_step_1',
    departement VARCHAR(50) DEFAULT 'TFXE',
    Used_norme VARCHAR(100),
    office_remark VARCHAR(300),
    FOREIGN KEY (echantillon_id) REFERENCES echantillons(id)
);
ALTER TABLE analyses ADD analysis_time INT;
ALTER TABLE analyses ADD analysis_result_file BLOB;



CREATE TABLE elementsdinteret (
    id INT AUTO_INCREMENT PRIMARY KEY,
    elementDinteret VARCHAR(255) NOT NULL,
    analysis_id INT NOT NULL,
    FOREIGN KEY (analysis_id) REFERENCES analyses(id)
);


CREATE TABLE resultats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    elementsdinteret_id INT NOT NULL,
    Unite VARCHAR(50) NOT NULL,
    Valeur_Moyenne VARCHAR(50) NOT NULL,
    Valeur_Norme_Utlise VARCHAR(50),
    Limite_Detection VARCHAR(50) NOT NULL,
    Observation VARCHAR(200),
    Incertitude VARCHAR(50) ,
    FOREIGN KEY (elementsdinteret_id) REFERENCES elementsdinteret(id)
);
CREATE TABLE conclusions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    departement VARCHAR(50) NOT NULL,
    conclusion VARCHAR(500) NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);
CREATE TABLE standard_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    elementsdinteret_id INT NOT NULL,
    Unite_s VARCHAR(50) NOT NULL,
    Valeur_Moyenne_standard VARCHAR(50) NOT NULL,
    Valeur_Moyenne_mesure VARCHAR(50) NOT NULL,
    FOREIGN KEY (elementsdinteret_id) REFERENCES elementsdinteret(id)
);


--suprimer les valeurs dans les tables
DELETE FROM resultats;
DELETE FROM results;
DELETE FROM elementsdinteret;
DELETE FROM analyses;
DELETE FROM echantillons;
DELETE FROM clients;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    login_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);