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

    if (isset($data->email) && isset($data->role)) {
        $email = $data->email;
        $role = $data->role;
        $department = isset($data->department) ? $data->department : null;
        
        // Define a default password (should be securely generated in a real application)
        $defaultPassword = "instn";
        $passwordHash = password_hash($defaultPassword, PASSWORD_DEFAULT);
        
        $sql = "INSERT INTO users (email, password, role, department) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ssss', $email, $passwordHash, $role, $department);

        if ($stmt->execute()) {
            echo json_encode(array('success' => true, 'message' => 'User created successfully'));
        } else {
            echo json_encode(array('success' => false, 'message' => 'Failed to create user'));
        }

        $stmt->close();
    } else {
        echo json_encode(array('success' => false, 'message' => 'Invalid input'));
    }
}

// Fermer la connexion à la base de données
$conn->close();
?>
