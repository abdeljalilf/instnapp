<?php
require_once '../../routes/login/session_util.php';
require_once '../../database/db_connection.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Vérifiez la session
$user = checkSession($conn);
authorize(['reception'], $user);

// Obtenez les données de la requête
$data = json_decode(file_get_contents('php://input'), true);

// Validation des données
if (!isset($data['clientId'], $data['departement'], $data['newStatus'])) {
    echo json_encode(['success' => false, 'message' => 'Données manquantes']);
    exit;
}

$clientId = $data['clientId'];
$departement = $data['departement'];
$newStatus = $data['newStatus'];

// Validation des données (exemple de validation basique)
if (!is_numeric($clientId) || !is_string($departement) || !is_string($newStatus)) {
    echo json_encode(['success' => false, 'message' => 'Données invalides']);
    exit;
}

// Trouver les IDs des échantillons associés au client
$sampleQuery = $conn->prepare("
    SELECT id FROM echantillons WHERE client_id = ?
");
$sampleQuery->bind_param('i', $clientId);
$sampleQuery->execute();
$result = $sampleQuery->get_result();
$sampleIds = $result->fetch_all(MYSQLI_ASSOC);

// Si aucun échantillon n'est trouvé pour ce client
if (empty($sampleIds)) {
    echo json_encode(['success' => false, 'message' => 'Aucun échantillon trouvé pour ce client']);
    exit;
}

// Mettre à jour les statuts des analyses pour le département spécifié
foreach ($sampleIds as $sample) {
    $query = $conn->prepare("
        UPDATE analyses
        SET validated = ?
        WHERE echantillon_id = ? AND departement = ?
    ");
    $query->bind_param('sis', $newStatus, $sample['id'], $departement);

    if (!$query->execute()) {
        echo json_encode(['success' => false, 'message' => 'Erreur lors de la mise à jour']);
        exit;
    }
}

echo json_encode(['success' => true, 'message' => 'Statut mis à jour']);
?>
