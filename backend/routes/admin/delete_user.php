<?php
// Inclure le fichier de configuration pour la connexion à la base de données
require_once '../../database/db_connection.php';

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Handle preflight request
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (isset($data->id)) {
        $id = $data->id;

        $sql = "DELETE FROM users WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $id);

        if ($stmt->execute()) {
            echo json_encode(array('success' => true, 'message' => 'User deleted successfully'));
        } else {
            echo json_encode(array('success' => false, 'message' => 'Failed to delete user'));
        }

        $stmt->close();
    } else {
        echo json_encode(array('success' => false, 'message' => 'Invalid input'));
    }
}

// Fermer la connexion à la base de données
$conn->close();
?>
