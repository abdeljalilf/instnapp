<?php
include '../../database/db_connection.php';

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

// Get the ID and department from the request
$id = intval($_GET['id']);
$department = isset($_GET['department']) ? $_GET['department'] : 'TFXE'; // Valeur par défaut si non spécifié

// Prepare the SQL query to update the analyses table based on the client ID and department
$sql = "
    UPDATE analyses
    JOIN echantillons ON analyses.echantillon_id = echantillons.id
    JOIN clients ON echantillons.client_id = clients.id
    SET analyses.validated = 'office_step_1'
    WHERE clients.id = ? AND analyses.departement = ?
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $id, $department);

$response = [];
if ($stmt->execute()) {
    $response['status'] = 'success';
    $response['message'] = 'Request validated successfully';
} else {
    $response['status'] = 'error';
    $response['message'] = 'Failed to validate request';
    $response['error'] = $stmt->error;
}

echo json_encode($response);

$stmt->close();
$conn->close();
?>
