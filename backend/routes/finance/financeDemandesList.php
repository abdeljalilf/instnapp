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
authorize(['finance'], $user);
// Récupérer toutes les demandes d'analyses validées
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT c.id as clientId, c.name, c.address, c.phone, c.email, c.clientReference, c.requestingDate, c.dilevery_delay,
                   e.id as echantillonId, e.sampleType, e.sampleReference, e.samplingLocation, e.samplingDate, e.sampledBy, 
                   a.id as analysisId, a.analysisType, a.parameter, a.technique, a.validated,
                   ed.id as elementId, ed.elementDinteret 
            FROM clients c 
            JOIN echantillons e ON c.id = e.client_id 
            JOIN analyses a ON e.id = a.echantillon_id AND a.validated = 'reception_step_1'
            LEFT JOIN elementsdinteret ed ON e.id = ed.analysis_id
            ORDER BY c.id DESC";
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
                    'requestingDate' => $row['requestingDate'],
                    'dilevery_delay' => $row['dilevery_delay'],
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
                    'validated' => $row['validated'],
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

// Mettre à jour la valeur de validated pour toutes les analyses d'une demande
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupérer les données envoyées
    $data = json_decode(file_get_contents("php://input"), true);
    $clientId = $data['clientId'];
    $newValidatedValue = $data['newValidatedValue'];

    // Mettre à jour les analyses
    $sql = "UPDATE analyses 
            SET validated = ?
            WHERE echantillon_id IN (
                SELECT e.id 
                FROM echantillons e
                WHERE e.client_id = ?
            )";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('si', $newValidatedValue, $clientId);

    if ($stmt->execute()) {
        echo json_encode(array('success' => true, 'message' => 'La valeur de validated a été mise à jour.'));
    } else {
        echo json_encode(array('success' => false, 'message' => 'Échec de la mise à jour de validated.'));
    }

    $stmt->close();
}

// Fermer la connexion à la base de données
$conn->close();
?>
