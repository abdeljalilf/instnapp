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

$data = json_decode(file_get_contents('php://input'), true);

$analysis_id = $data['analysis_id'];
$office_remark = $data['office_remark'];

if ($analysis_id && $office_remark) {
    $query = "UPDATE analyses SET validated = 'office_reject', office_remark = ? WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('si', $office_remark, $analysis_id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'La demande de révision a été soumise avec succès.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erreur lors de la mise à jour de la base de données.']);
    }

    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Données invalides fournies.']);
}

$conn->close();
?>
