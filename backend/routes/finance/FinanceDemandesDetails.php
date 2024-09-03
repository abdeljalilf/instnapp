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

// Récupérer les détails de la demande à partir de la référence client
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['referenceClient']) && !empty($_GET['referenceClient'])) {
        $referenceClient = $_GET['referenceClient'];

        $sql = "SELECT c.id as clientId, c.name, c.address, c.phone, c.email, c.clientReference, c.dilevery_delay, c.requestingDate, c.broughtBy,
                       e.id as echantillonId, e.sampleType, e.sampleReference, e.samplingLocation, e.samplingDate, e.sampledBy, e.sampleSize, e.sampleObservations,
                       a.id as analysisId, a.analysisType, a.parameter, a.technique, 
                       ed.id as elementId, ed.elementDinteret 
                FROM clients c 
                JOIN echantillons e ON c.id = e.client_id 
                JOIN analyses a ON e.id = a.echantillon_id
                LEFT JOIN elementsdinteret ed ON a.id = ed.analysis_id
                WHERE c.clientReference = ?";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('s', $referenceClient);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $demandes = array();
            while ($row = $result->fetch_assoc()) {
                $clientId = $row['clientId'];
                $echantillonId = $row['echantillonId'];
                $analysisId = $row['analysisId'];

                if (!isset($demandes[$clientId])) {
                    $demandes[$clientId] = array(
                        'clientId' => $clientId,
                        'clientReference' => $row['clientReference'],
                        'name' => $row['name'],
                        'address' => $row['address'],
                        'phone' => $row['phone'],
                        'email' => $row['email'],
                        'broughtBy' => $row['broughtBy'],
                        'dilevery_delay' => $row['dilevery_delay'],
                        'requestingDate' => $row['requestingDate'],
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
                        'sampleSize' => $row['sampleSize'],
                        'sampleObservations' => $row['sampleObservations'],
                        'broughtBy' => $row['broughtBy'],
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
            echo json_encode(array('success' => false, 'message' => 'Aucune demande trouvée pour cette référence client.'));
        }

        $stmt->close();
    } else {
        echo json_encode(array('success' => false, 'message' => 'Paramètre referenceClient manquant ou vide.'));
    }
}

// Fermer la connexion à la base de données
$conn->close();
?>
