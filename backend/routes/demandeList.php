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

// Récupérer toutes les demandes d'analyses
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT c.id as clientId, c.name, c.address, c.phone, c.email, c.clientReference,
                   e.id as echantillonId, e.sampleType, e.sampleReference, e.samplingLocation, e.samplingDate, e.sampledBy, 
                   a.id as analysisId, a.analysisType, a.parameter, a.technique, 
                   ed.id as elementId, ed.elementDinteret 
            FROM clients c 
            JOIN echantillons e ON c.id = e.client_id 
            JOIN analyses a ON e.id = a.echantillon_id
            LEFT JOIN elementsdinteret ed ON e.id = ed.analysis_id";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $demandes = array();
        while ($row = $result->fetch_assoc()) {
            $clientReference = $row['clientReference'];
            $clientId = $row['clientId'];
            $echantillonId = $row['echantillonId'];
            $analysisId = $row['analysisId'];

            if (!isset($demandes[$clientId])) {
                $demandes[$clientId] = array(
                    'clientId' => $clientId,
                    'clientReference' => $clientReference,
                    'name' => $row['name'],
                    'address' => $row['address'],
                    'phone' => $row['phone'],
                    'email' => $row['email'],
                    'echantillons' => array()
                );
            }

            if (!isset($demandes[$clientId]['echantillons'][$echantillonId])) {
                $demandes[$clientId]['echantillons'][$echantillonId] = array(
                    'echantillonId' => $echantillonId,
                    'sampleType' => $row['sampleType'],
                    'sampleReference' => $row['sampleReference'],
                    'samplingLocation' => $row['samplingLocation'],
                    'samplingDate' => $row['samplingDate'],
                    'sampledBy' => $row['sampledBy'],
                    'analyses' => array()
                );
            }

            if (!isset($demandes[$clientId]['echantillons'][$echantillonId]['analyses'][$analysisId])) {
                $demandes[$clientId]['echantillons'][$echantillonId]['analyses'][$analysisId] = array(
                    'analysisId' => $analysisId,
                    'analysisType' => $row['analysisType'],
                    'parameter' => $row['parameter'],
                    'technique' => $row['technique'],
                    'elementsDinteret' => array()
                );
            }

            if ($row['elementId'] !== null) {
                $demandes[$clientId]['echantillons'][$echantillonId]['analyses'][$analysisId]['elementsDinteret'][] = array(
                    'elementId' => $row['elementId'],
                    'elementDinteret' => $row['elementDinteret']
                );
            }
        }

        // Réorganiser pour envoyer les données sous la forme d'un tableau
        $response = array('success' => true, 'demandes' => array_values($demandes));
        foreach ($response['demandes'] as &$client) {
            $client['echantillons'] = array_values($client['echantillons']);
            foreach ($client['echantillons'] as &$echantillon) {
                $echantillon['analyses'] = array_values($echantillon['analyses']);
            }
        }

        echo json_encode($response);
    } else {
        echo json_encode(array('success' => false, 'message' => 'Aucune demande trouvée.'));
    }
}

// Fermer la connexion à la base de données
$conn->close();
?>