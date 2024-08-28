CREATE DATABASE laboratoire;

USE laboratoire;

CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    clientReference VARCHAR(255),
    cle_client VARCHAR(255),
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
    validated VARCHAR(50) DEFAULT 'reception_step_1',
    departement VARCHAR(50) DEFAULT 'TFXE',
    Used_norme VARCHAR(100),
    office_remark VARCHAR(300),
    analyse_time VARCHAR(300),
    FOREIGN KEY (echantillon_id) REFERENCES echantillons(id)
);

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
CREATE TABLE analyse_qualite (
    id INT AUTO_INCREMENT PRIMARY KEY,
    elementsdinteret_id INT NOT NULL,
    Reference_Materiel VARCHAR(255),
    Valeur_Recommandee VARCHAR(50),
    Valeur_Mesuree VARCHAR(50),
    FOREIGN KEY (elementsdinteret_id) REFERENCES elementsdinteret(id)
);


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
CREATE TABLE fichiers_excel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    analysis_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
);



--suprimer les valeurs dans les tables
DELETE FROM resultats;
DELETE FROM results;
DELETE FROM elementsdinteret;
DELETE FROM analyses;
DELETE FROM echantillons;
DELETE FROM clients;

-- Assurez-vous d'adapter les valeurs des colonnes en fonction de vos besoins

INSERT INTO analyse_qualite (elementsdinteret_id, Reference_Materiel, Valeur_Recommandee, Valeur_Mesuree) VALUES
(1, 'Ref001', 'Valeur1', 'Mesuree1'),
(2, 'Ref002', 'Valeur2', 'Mesuree2'),
(3, 'Ref003', 'Valeur3', 'Mesuree3'),
(4, 'Ref004', 'Valeur4', 'Mesuree4'),
(5, 'Ref005', 'Valeur5', 'Mesuree5'),
(6, 'Ref006', 'Valeur6', 'Mesuree6'),
(7, 'Ref007', 'Valeur7', 'Mesuree7'),
(8, 'Ref008', 'Valeur8', 'Mesuree8'),
(9, 'Ref009', 'Valeur9', 'Mesuree9'),
(10, 'Ref010', 'Valeur10', 'Mesuree10'),
(11, 'Ref011', 'Valeur11', 'Mesuree11'),
(12, 'Ref012', 'Valeur12', 'Mesuree12'),
(13, 'Ref013', 'Valeur13', 'Mesuree13'),
(14, 'Ref014', 'Valeur14', 'Mesuree14'),
(15, 'Ref015', 'Valeur15', 'Mesuree15'),
(16, 'Ref016', 'Valeur16', 'Mesuree16'),
(17, 'Ref017', 'Valeur17', 'Mesuree17'),
(18, 'Ref018', 'Valeur18', 'Mesuree18'),
(19, 'Ref019', 'Valeur19', 'Mesuree19'),
(20, 'Ref020', 'Valeur20', 'Mesuree20');
-- Insérer 20 valeurs supplémentaires dans la table analyse_qualite

INSERT INTO analyse_qualite (elementsdinteret_id, Reference_Materiel, Valeur_Recommandee, Valeur_Mesuree) VALUES
(21, 'Ref021', 'Valeur21', 'Mesuree21'),
(22, 'Ref022', 'Valeur22', 'Mesuree22'),
(23, 'Ref023', 'Valeur23', 'Mesuree23'),
(24, 'Ref024', 'Valeur24', 'Mesuree24'),
(25, 'Ref025', 'Valeur25', 'Mesuree25'),
(26, 'Ref026', 'Valeur26', 'Mesuree26'),
(27, 'Ref027', 'Valeur27', 'Mesuree27'),
(28, 'Ref028', 'Valeur28', 'Mesuree28'),
(29, 'Ref029', 'Valeur29', 'Mesuree29'),
(30, 'Ref030', 'Valeur30', 'Mesuree30'),
(31, 'Ref031', 'Valeur31', 'Mesuree31'),
(32, 'Ref032', 'Valeur32', 'Mesuree32'),
(33, 'Ref033', 'Valeur33', 'Mesuree33'),
(34, 'Ref034', 'Valeur34', 'Mesuree34'),
(35, 'Ref035', 'Valeur35', 'Mesuree35'),
(36, 'Ref036', 'Valeur36', 'Mesuree36'),
(37, 'Ref037', 'Valeur37', 'Mesuree37'),
(38, 'Ref038', 'Valeur38', 'Mesuree38'),
(39, 'Ref039', 'Valeur39', 'Mesuree39'),
(40, 'Ref040', 'Valeur40', 'Mesuree40');
