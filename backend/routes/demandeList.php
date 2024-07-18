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
    $sql = "SELECT c.id as clientId, c.name, c.address, c.phone, c.email, e.id as echantillonId, e.sampleType, e.samplingLocation, e.samplingDate, e.sampledBy, 
            a.id as analysisId, a.analysisType, a.parameter, a.technique, 
            ed.id as elementId, ed.elementDinteret 
            FROM clients c 
            JOIN echantillons e ON c.id = e.client_id 
            JOIN analyses a ON e.id = a.echantillon_id
            JOIN elementsdinteret ed ON e.id = ed.echantillon_id";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $demandes = array();
        while ($row = $result->fetch_assoc()) {
            $demandes[] = $row;
        }
        echo json_encode(array('success' => true, 'demandes' => $demandes));
    } else {
        echo json_encode(array('success' => false, 'message' => 'Aucune demande trouvée.'));
    }
}

// Fermer la connexion à la base de données
$conn->close();
?>
