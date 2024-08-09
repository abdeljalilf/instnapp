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

// Vérifiez la session
$user = checkSession($conn);
authorize(['admin'], $user);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (isset($data->id) && isset($data->email) && isset($data->role)) {
        $id = $data->id;
        $email = $data->email;
        $role = $data->role;
        $department = isset($data->department) ? $data->department : null;

        $sql = "UPDATE users SET email = ?, role = ?, department = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('sssi', $email, $role, $department, $id);

        if ($stmt->execute()) {
            echo json_encode(array('success' => true, 'message' => 'User updated successfully'));
        } else {
            echo json_encode(array('success' => false, 'message' => 'Failed to update user'));
        }

        $stmt->close();
    } else {
        echo json_encode(array('success' => false, 'message' => 'Invalid input'));
    }
}

// Fermer la connexion à la base de données
$conn->close();
?>