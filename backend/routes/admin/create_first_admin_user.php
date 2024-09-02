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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if there is already an admin user
    $checkAdminSql = "SELECT COUNT(*) AS admin_count FROM users WHERE role = 'admin'";
    $result = $conn->query($checkAdminSql);
    $row = $result->fetch_assoc();

    if ($row['admin_count'] == 0) {
        // No admin exists, create the first admin user
        $email = "first-admin@created";
        $role = "admin";
        $defaultPassword = "instn";
        $passwordHash = password_hash($defaultPassword, PASSWORD_DEFAULT);

        $sql = "INSERT INTO users (email, password, role) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('sss', $email, $passwordHash, $role);

        if ($stmt->execute()) {
            echo json_encode(array('success' => true, 'message' => 'First admin user created successfully'));
        } else {
            echo json_encode(array('success' => false, 'message' => 'Failed to create admin user'));
        }

        $stmt->close();
    } else {
        // Admin user already exists, do nothing
        echo json_encode(array('success' => false, 'message' => 'Admin user already exists'));
    }

    $result->close();
}

// Close the database connection
$conn->close();
?>
