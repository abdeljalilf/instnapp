<?php
require_once '../../routes/login/session_util.php';
require_once '../../database/db_connection.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Vérifiez la session
$user = checkSession($conn);
authorize(['reception'], $user);


// Fonction pour générer la référence client
function generateClientReference($clientId, $year, $month) {
    // Formater l'année en 2 chiffres
    $shortYear = substr($year, -2);
    // Formater le nombre de demande avec des zéros en tête pour avoir 4 chiffres
    $formattedClientCount = str_pad($clientId, 4, '0', STR_PAD_LEFT);
    
    // Générer la référence client au format : DS{YYMM}-A{clientCount}
    return sprintf("DS%s%s-A%s", $shortYear, str_pad($month, 2, '0', STR_PAD_LEFT), $formattedClientCount);
}

// Fonction pour générer la référence échantillon
function generateSampleReference($year, $month, $clientCount, $sampleNumber) {
    // Formater l'année en 2 chiffres
    $shortYear = substr($year, -2);
    // Formater le nombre de demande avec des zéros en tête pour avoir 4 chiffres
    $formattedClientCount = str_pad($clientCount, 4, '0', STR_PAD_LEFT);
    // Formater le numéro d'échantillon avec des zéros en tête pour avoir 2 chiffres
    $formattedSampleNumber = str_pad($sampleNumber, 2, '0', STR_PAD_LEFT);
    
    // Générer la référence échantillon au format : {YYMM}-A{clientCount}-E{sampleNumber}
    return sprintf("%s%s-A%s-E%s", $shortYear, str_pad($month, 2, '0', STR_PAD_LEFT), $formattedClientCount, $formattedSampleNumber);
}

$techniqueToDepartement = [
    "Spectrometrie d'Absportion Atomic (SAA)" => 'TFXE',
    'Analyseur Direct de Mercure (ADM)' => 'TFXE',
    'Chromatographie Ionique (CI)' => 'HI',
    'Spectrometre Gamma' => 'ATN',
    'Spectrometre alpha' => 'ATN',
    'Fluorescence X a Energie Dispersive (FXDE)' => 'TFXE',
    'Gravimetrie' => 'TFXE',
    'Multi-paramètres' => 'HI',
    'Titration Digitale' => 'HI',
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
    $cleClient = $conn->real_escape_string($personalInfo['cleClient']);
    $requestingDate = $conn->real_escape_string($personalInfo['requestingDate']);
    $dilevery_delay = $conn->real_escape_string($personalInfo['dilevery_delay']);
    $broughtBy = $conn->real_escape_string($personalInfo['broughtBy']);
    // Commencer une transaction
    $conn->begin_transaction();

    try {
        // Insérer le client sans la référence client pour obtenir l'ID du client
        $sqlInsertClient = "INSERT INTO clients (name, address, phone, email, dilevery_delay, requestingDate, broughtBy, cle_Client) VALUES ('$name', '$address', '$phone', '$email', '$dilevery_delay', '$requestingDate', '$broughtBy', '$cleClient')";
        if (!$conn->query($sqlInsertClient)) {
            throw new Exception('Erreur lors de l\'insertion du client: ' . $conn->error);
        }

        $clientId = $conn->insert_id;

        // Générer la référence client
        $year = date('y');
        $month = date('m');
        $clientReference = generateClientReference($clientId, $year, $month);

        // Mettre à jour la référence client
        $sqlUpdateClientReference = "UPDATE clients SET clientReference='$clientReference' WHERE id='$clientId'";
        if (!$conn->query($sqlUpdateClientReference)) {
            throw new Exception('Erreur lors de la mise à jour de la référence client: ' . $conn->error);
        }

        // Compteur pour les échantillons du client
        $sampleCount = 0;

        // Exemple d'insertion des données dans la base de données (à adapter selon votre structure de base de données)
        foreach ($samples as $sample) {
            $midacNumber = $conn->real_escape_string($sample['midacNumber']);
            $sampleType = $conn->real_escape_string($sample['sampleType']);
            $samplingLocation = $conn->real_escape_string($sample['samplingLocation']);
            $samplingDate = $conn->real_escape_string($sample['samplingDate']);
            $samplingTime = $conn->real_escape_string($sample['samplingTime']);
            $sampledBy = $conn->real_escape_string($sample['sampledBy']);
            $quantiteDenree = $conn->real_escape_string($sample['quantiteDenree']);
            $sampleSize = $conn->real_escape_string($sample['sampleSize']);
            $sampleObservations = $conn->real_escape_string($sample['sampleObservations']);
            $clientSampleRefrence = $conn->real_escape_string($sample['clientSampleRefrence']);
            // Incrémenter le compteur d'échantillons
            $sampleCount++;

            // Générer la référence échantillon
            $sampleReference = generateSampleReference($year, $month, $clientId, $sampleCount);

            // Insertion dans la table des échantillons (exemple)
            $sqlInsertSample = "INSERT INTO echantillons (client_id, sampleType, samplingLocation, samplingDate, sampledBy, sampleReference, sampleSize, sampleObservations, midacNumber, samplingTime, quantiteDenree, clientSampleRefrence) VALUES ('$clientId', '$sampleType', '$samplingLocation', '$samplingDate', '$sampledBy', '$sampleReference', '$sampleSize', '$sampleObservations', '$midacNumber', '$samplingTime', '$quantiteDenree', '$clientSampleRefrence')";
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
            'samplesReferences' => $sampleReference,
            'clientId' => $clientId
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