<?php
require_once '../../database/db_connection.php';
require_once './session_util.php'; // Assuming this checks sessions

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$user = checkSession($conn); // Get the session and user details
authorize(['admin'], $user); // Ensure the user has the admin role


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $email = $data->email ?? null;

    if (!$email) {
        echo json_encode(array('success' => false, 'message' => 'Email is required.'));
        exit;
    }

    // Default password to set
    $defaultPassword = 'instn';
    $hashedPassword = password_hash($defaultPassword, PASSWORD_DEFAULT);

    // Update password for the user with the given email
    $sql = "UPDATE users SET password = ? WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ss', $hashedPassword, $email);

    if ($stmt->execute()) {
        echo json_encode(array('success' => true, 'message' => 'Password reset successfully.'));
    } else {
        echo json_encode(array('success' => false, 'message' => 'Failed to reset password.'));
    }

    $stmt->close();
}

$conn->close();
?>
