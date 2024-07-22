<?php
// Inclure le fichier de configuration pour la connexion à la base de données
require_once '../config.php';

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Handle preflight request
    http_response_code(200);
    exit;
}

// Fonction pour générer la référence client
function generateClientReference($clientId, $year) {
    return sprintf("INSTN/DG/XRF/%s/%04d", $year, $clientId);
}

// Fonction pour générer la référence échantillon
function generateSampleReference($year, $clientId, $sampleCount) {
    return sprintf("%s%04dC%02d", $year, $clientId, $sampleCount);
}

// Vérifier si une requête POST a été envoyée depuis le formulaire React
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupérer les données JSON envoyées depuis le formulaire React
    $data = json_decode(file_get_contents('php://input'), true);

    // Extraire les informations personnelles et les échantillons de la demande d'analyse
    $personalInfo = $data['personalInfo'];
    $samples = $data['samples'];

    // Insertion des informations personnelles dans la table `clients`
    $name = $conn->real_escape_string($personalInfo['name']);
    $address = $conn->real_escape_string($personalInfo['address']);
    $phone = $conn->real_escape_string($personalInfo['phone']);
    $email = $conn->real_escape_string($personalInfo['email']);

    $sqlInsertClient = "INSERT INTO clients (name, address, phone, email) VALUES ('$name', '$address', '$phone', '$email')";
    if (!$conn->query($sqlInsertClient)) {
        http_response_code(500);
        echo json_encode(array('success' => false, 'message' => 'Erreur lors de l\'insertion du client.', 'error' => $conn->error));
        exit;
    }

    $clientId = $conn->insert_id;

    // Générer et mettre à jour la référence client
    $year = date('y');
    $clientReference = generateClientReference($clientId, $year);
    $sqlUpdateClientReference = "UPDATE clients SET clientReference='$clientReference' WHERE id='$clientId'";
    if (!$conn->query($sqlUpdateClientReference)) {
        http_response_code(500);
        echo json_encode(array('success' => false, 'message' => 'Erreur lors de la mise à jour de la référence client.', 'error' => $conn->error));
        exit;
    }

    // Compteur pour les échantillons du client
    $sampleCount = 0;

    // Exemple d'insertion des données dans la base de données (à adapter selon votre structure de base de données)
    foreach ($samples as $sample) {
        $sampleType = $conn->real_escape_string($sample['sampleType']);
        $samplingLocation = $conn->real_escape_string($sample['samplingLocation']);
        $samplingDate = $conn->real_escape_string($sample['samplingDate']);
        $sampledBy = $conn->real_escape_string($sample['sampledBy']);

        // Incrémenter le compteur d'échantillons
        $sampleCount++;

        // Générer la référence échantillon
        $sampleReference = generateSampleReference($year, $clientId, $sampleCount);

        // Insertion dans la table des échantillons (exemple)
        $sqlInsertSample = "INSERT INTO echantillons (client_id, sampleType, samplingLocation, samplingDate, sampledBy, sampleReference) VALUES ('$clientId', '$sampleType', '$samplingLocation', '$samplingDate', '$sampledBy', '$sampleReference')";
        if (!$conn->query($sqlInsertSample)) {
            http_response_code(500);
            echo json_encode(array('success' => false, 'message' => 'Erreur lors de l\'insertion de l\'échantillon.', 'error' => $conn->error));
            exit();
        }

        $sampleId = $conn->insert_id;

        // Insertion dans la table des détails d'analyse pour cet échantillon (exemple)
        foreach ($sample['analysisDetails'] as $analysis) {
            $analysisType = $conn->real_escape_string($analysis['analysisType']);
            $parameter = $conn->real_escape_string($analysis['parameter']);
            $technique = $conn->real_escape_string($analysis['technique']);
            $elements = $analysis['element'];

            $sqlInsertAnalysis = "INSERT INTO analyses (echantillon_id, analysisType, parameter, technique) VALUES ('$sampleId', '$analysisType', '$parameter', '$technique')";
            if (!$conn->query($sqlInsertAnalysis)) {
                http_response_code(500);
                echo json_encode(array('success' => false, 'message' => 'Erreur lors de l\'insertion des détails d\'analyse.', 'error' => $conn->error));
                exit();
            }

            $analysisId = $conn->insert_id; // Récupérer l'ID de l'analyse insérée

            // Insertion des éléments d'intérêt pour cette analyse
            foreach ($elements as $element) {
                $element = $conn->real_escape_string($element);
                $sqlInsertElement = "INSERT INTO elementsDinteret (elementDinteret, analysis_id) VALUES ('$element', '$analysisId')";
                if (!$conn->query($sqlInsertElement)) {
                    http_response_code(500);
                    echo json_encode(array('success' => false, 'message' => 'Erreur lors de l\'insertion des éléments d\'intérêt.', 'error' => $conn->error));
                    exit();
                }
            }
        }
    }

    // Réponse JSON pour confirmer la réussite de l'insertion (exemple)
    $response = array('success' => true, 'message' => 'Demande d\'analyse enregistrée avec succès','clientReference' => $clientReference,
    'samplesReferences' => $sampleReference);
    header('Content-Type: application/json');
    echo json_encode($response);
}

// Fermer la connexion à la base de données
$conn->close();
?>