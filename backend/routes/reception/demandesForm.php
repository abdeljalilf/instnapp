<?php
// Inclure le fichier de configuration pour la connexion à la base de données
require_once '../../database/db_connection.php';

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
    return sprintf("%s/%04d/INSTN/DG/", $year, $clientId);
}

// Fonction pour générer la référence échantillon
function generateSampleReference($year, $clientId, $sampleCount) {
    return sprintf("%s%04dS%02d", $year, $clientId, $sampleCount);
}
$techniqueToDepartement = [
    "Spectrometrie d Absportion Atomic (SAA)" => "TFXE",
    "Analyseur Direct de Mercure (ADM)" => "TFXE",
    "Chromatographie Ionique (CI)" => "HI",
    "Spectrometre Gamma" => "ATN",
    "Spectrometre alpha" => "ATN",
    "Fluorescence X a Energie Dispersive (FXDE)" => "TFXE",
    "Gravimetrie" => "TFXE"
];

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
    $requestingDate = $conn->real_escape_string($personalInfo['requestingDate']);
    $dilevery_delay = $conn->real_escape_string($personalInfo['dilevery_delay']);

    // Commencer une transaction
    $conn->begin_transaction();

    try {
        // Insérer le client sans la référence client pour obtenir l'ID du client
        $sqlInsertClient = "INSERT INTO clients (name, address, phone, email, dilevery_delay, requestingDate) VALUES ('$name', '$address', '$phone', '$email', '$dilevery_delay', '$requestingDate')";
        if (!$conn->query($sqlInsertClient)) {
            throw new Exception('Erreur lors de l\'insertion du client: ' . $conn->error);
        }

        $clientId = $conn->insert_id;

        // Générer la référence client
        $year = date('y');
        $clientReference = generateClientReference($clientId, $year);

        // Mettre à jour la référence client
        $sqlUpdateClientReference = "UPDATE clients SET clientReference='$clientReference' WHERE id='$clientId'";
        if (!$conn->query($sqlUpdateClientReference)) {
            throw new Exception('Erreur lors de la mise à jour de la référence client: ' . $conn->error);
        }

        // Compteur pour les échantillons du client
        $sampleCount = 0;

        // Exemple d'insertion des données dans la base de données (à adapter selon votre structure de base de données)
        foreach ($samples as $sample) {
            $sampleType = $conn->real_escape_string($sample['sampleType']);
            $samplingLocation = $conn->real_escape_string($sample['samplingLocation']);
            $samplingDate = $conn->real_escape_string($sample['samplingDate']);
            $sampledBy = $conn->real_escape_string($sample['sampledBy']);
            $broughtBy = $conn->real_escape_string($sample['broughtBy']);
            $sampleSize = $conn->real_escape_string($sample['sampleSize']);
            $sampleObservations = $conn->real_escape_string($sample['sampleObservations']);

            // Incrémenter le compteur d'échantillons
            $sampleCount++;

            // Générer la référence échantillon
            $sampleReference = generateSampleReference($year, $clientId, $sampleCount);

            // Insertion dans la table des échantillons (exemple)
            $sqlInsertSample = "INSERT INTO echantillons (client_id, sampleType, samplingLocation, samplingDate, sampledBy, sampleReference, broughtBy, sampleSize, sampleObservations) VALUES ('$clientId', '$sampleType', '$samplingLocation', '$samplingDate', '$sampledBy', '$sampleReference', '$broughtBy', '$sampleSize', '$sampleObservations')";
            if (!$conn->query($sqlInsertSample)) {
                throw new Exception('Erreur lors de l\'insertion de l\'échantillon: ' . $conn->error);
            }

            $sampleId = $conn->insert_id;

            // Insertion dans la table des détails d'analyse pour cet échantillon (exemple)
            foreach ($sample['analysisDetails'] as $analysis) {
                $analysisType = $conn->real_escape_string($analysis['analysisType']);
                $parameter = $conn->real_escape_string($analysis['parameter']);
                $technique = $conn->real_escape_string($analysis['technique']);
                $departement = isset($techniqueToDepartement[$technique]) ? $techniqueToDepartement[$technique] : 'Unknown';
                $elements = $analysis['element'];

                $sqlInsertAnalysis = "INSERT INTO analyses (echantillon_id, analysisType, parameter, technique,departement) VALUES ('$sampleId', '$analysisType', '$parameter', '$technique','$departement')";
                if (!$conn->query($sqlInsertAnalysis)) {
                    throw new Exception('Erreur lors de l\'insertion des détails d\'analyse: ' . $conn->error);
                }

                $analysisId = $conn->insert_id; // Récupérer l'ID de l'analyse insérée

                // Insertion des éléments d'intérêt pour cette analyse
                foreach ($elements as $element) {
                    $element = $conn->real_escape_string($element);
                    $sqlInsertElement = "INSERT INTO elementsDinteret (elementDinteret, analysis_id) VALUES ('$element', '$analysisId')";
                    if (!$conn->query($sqlInsertElement)) {
                        throw new Exception('Erreur lors de l\'insertion des éléments d\'intérêt: ' . $conn->error);
                    }
                }
            }
        }

        // Valider la transaction
        $conn->commit();

        // Réponse JSON pour confirmer la réussite de l'insertion (exemple)
        $response = array(
            'success' => true,
            'message' => 'Demande d\'analyse enregistrée avec succès',
            'clientReference' => $clientReference,
            'samplesReferences' => $sampleReference
        );
        header('Content-Type: application/json');
        echo json_encode($response);

    } catch (Exception $e) {
        // Annuler la transaction en cas d'erreur
        $conn->rollback();
        http_response_code(500);
        echo json_encode(array('success' => false, 'message' => $e->getMessage()));
    }
}

// Fermer la connexion à la base de données
$conn->close();
?>