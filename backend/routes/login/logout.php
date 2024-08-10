<?php
require_once '../../database/db_connection.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$headers = apache_request_headers();
$session_id = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if ($session_id) {
    $sql = "DELETE FROM sessions WHERE session_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $session_id);

    if ($stmt->execute()) {
        echo json_encode(array('success' => true, 'message' => 'Logged out successfully'));
    } else {
        echo json_encode(array('success' => false, 'message' => 'Failed to logout'));
    }

    $stmt->close();
} else {
    echo json_encode(array('success' => false, 'message' => 'No session ID provided'));
}

$conn->close();
?>
