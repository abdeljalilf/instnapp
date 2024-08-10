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




// Get the department parameter from the URL
$department = isset($_GET['department']) ? $_GET['department'] : '';

// Vérifiez la session
$user = checkSession($conn);
authorize(['bureau'], $user, $department);

$id = intval($_GET['id']);

// Préparer la requête SQL
$sql = "SELECT 
            clients.id AS demande_id, 
            clients.name, 
            clients.address, 
            clients.phone, 
            clients.email, 
            clients.dilevery_delay,
            echantillons.id AS echantillon_id,
            echantillons.sampleType, 
            echantillons.samplingLocation, 
            echantillons.samplingDate, 
            echantillons.sampledBy,
            analyses.id AS analyse_id,
            analyses.analysisType, 
            analyses.parameter, 
            analyses.technique,
            GROUP_CONCAT(elementsdinteret.elementDinteret SEPARATOR ', ') AS elementDinteret
        FROM clients
        JOIN echantillons ON clients.id = echantillons.client_id
        JOIN analyses ON echantillons.id = analyses.echantillon_id
        LEFT JOIN elementsdinteret ON analyses.id = elementsdinteret.analysis_id
        WHERE clients.id = ? AND analyses.departement = ?
        GROUP BY analyses.id";

$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $id, $department); // Bind both id and department
$stmt->execute();
$result = $stmt->get_result();

// Récupérer toutes les lignes de résultats
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

// Vérifier si des données ont été trouvées
if (empty($data)) {
    echo json_encode(['error' => 'Aucune demande trouvée pour cet ID.']);
} else {
    echo json_encode($data);
}

$conn->close();
?>
