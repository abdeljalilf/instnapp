<?php
// validaterapport.php

// Display PHP errors (not for production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Add CORS headers if needed
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json'); // Ensure content is JSON

include '../../database/db_connection.php';

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
