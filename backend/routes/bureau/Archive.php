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

// Prepare and execute query based on the department
$sql = "SELECT clients.id AS demande_id, clients.clientReference, clients.dilevery_delay, echantillons.sampleType, analyses.analysisType, analyses.validated, analyses.departement 
        FROM clients 
        JOIN echantillons ON clients.id = echantillons.client_id 
        JOIN analyses ON echantillons.id = analyses.echantillon_id 
        WHERE analyses.validated IN ('office_step_2', 'office_step_3')";

if ($department) {
    $sql .= " AND analyses.departement = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $department); // Bind the department parameter
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $conn->query($sql);
}

$requests = array();

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $demande_id = $row['demande_id'];
        if (!isset($requests[$demande_id])) {
            $requests[$demande_id] = [
                'demande_id' => $demande_id,
                'dilevery_delay' => $row['dilevery_delay'],
                'clientReference' => $row['clientReference'],
                'samples' => [],
                'all_validated' => true // Assume all analyses are validated initially
            ];
        }
        $sampleType = $row['sampleType'];
        if (!isset($requests[$demande_id]['samples'][$sampleType])) {
            $requests[$demande_id]['samples'][$sampleType] = [];
        }
        $requests[$demande_id]['samples'][$sampleType][] = $row['analysisType'];
        
        // Check the validation status for the specific department
        if ($row['departement'] == $department && $row['validated'] !== 'office_step_2') {
            $requests[$demande_id]['all_validated'] = false;
        }
    }
}

// Convert the associative array to an indexed array
$requests = array_values($requests);

// Add the status field
foreach ($requests as &$request) {
    $request['status'] = $request['all_validated'] ? 'Pas encore validée' : 'Validée';
}

echo json_encode($requests);

$conn->close();
?>
