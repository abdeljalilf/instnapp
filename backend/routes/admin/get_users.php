<?php
// Inclure le fichier de configuration pour la connexion à la base de données
require_once '../../database/db_connection.php';

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Handle preflight request
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM users";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $users = array();
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        echo json_encode($users);
    } else {
        echo json_encode(array('success' => false, 'message' => 'No users found.'));
    }

    $result->close();
}

// Fermer la connexion à la base de données
$conn->close();
?>
