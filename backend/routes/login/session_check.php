<?php
require_once '../../database/db_connection.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$headers = apache_request_headers();
$session_id = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if ($session_id) {
    $sql = "SELECT sessions.session_id, sessions.login_time, users.email, users.role, users.department
            FROM sessions
            JOIN users ON sessions.user_id = users.id
            WHERE sessions.session_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $session_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $session = $result->fetch_assoc();
        $login_time = strtotime($session['login_time']);
        $current_time = time();

        if (($current_time - $login_time) > 28800) { // 8 hours = 28800 seconds
            $sql = "DELETE FROM sessions WHERE session_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('s', $session_id);
            $stmt->execute();

            echo json_encode(array('logged_in' => false, 'message' => 'Session expired'));
        } else {
            echo json_encode(array('logged_in' => true, 'user' => array(
                'email' => $session['email'],
                'role' => $session['role'],
                'department' => $session['department']
            )));
        }
    } else {
        echo json_encode(array('logged_in' => false, 'message' => 'No active session'));
    }

    $stmt->close();
} else {
    echo json_encode(array('logged_in' => false, 'message' => 'No session ID provided'));
}

$conn->close();
?>
