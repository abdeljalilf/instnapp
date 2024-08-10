<?php
// validaterapport.php
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
// Get the ID and department from the request
$id = intval($_GET['id']);

// Vérifiez la session
$user = checkSession($conn);
authorize(['bureau'], $user, $department);

// Display PHP errors (not for production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$data = json_decode(file_get_contents('php://input'), true);

// Ensure that 'client_id' (formerly 'demande_id') and 'newValidatedValue' are present in the request
if (isset($data['demande_id']) && isset($data['newValidatedValue'])) {
    $client_id = $data['demande_id']; // Use 'demande_id' to refer to the 'client_id'
    $newValidatedValue = $data['newValidatedValue'];

    // Update the 'validated' status for all analyses associated with the given client_id
    $query = "
        UPDATE analyses 
        SET validated = ? 
        WHERE echantillon_id IN (
            SELECT e.id 
            FROM echantillons e
            JOIN clients c ON e.client_id = c.id
            WHERE c.id = ?
        )
    ";

    // Prepare the query
    $stmt = $conn->prepare($query);

    // Check for preparation errors
    if (!$stmt) {
        echo json_encode(['success' => false, 'error' => 'Failed to prepare statement: ' . $conn->error]);
        exit;
    }

    // Bind parameters and execute the query
    $stmt->bind_param('si', $newValidatedValue, $client_id);

    // Execute the query and check for success
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Échec de la mise à jour des données: ' . $stmt->error]);
    }

    // Close the statement
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'error' => 'Données non valides']);
}

// Close the connection
$conn->close();
?>
