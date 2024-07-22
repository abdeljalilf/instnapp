<?php
include '../db/db_connection.php';

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

// Get the ID from the request
$id = intval($_GET['id']);

// Prepare the SQL query to update the analyses table based on the client ID and department
$sql = "
    UPDATE analyses
    JOIN echantillons ON analyses.echantillon_id = echantillons.id
    JOIN clients ON echantillons.client_id = clients.id
    SET analyses.validated = 'valid'
    WHERE clients.id = ? AND analyses.departement = 'TFXE'
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

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
