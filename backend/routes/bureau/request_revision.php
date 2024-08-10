<?php
include '../../database/db_connection.php';
// Ajoutez les en-têtes CORS si nécessaire
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
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
