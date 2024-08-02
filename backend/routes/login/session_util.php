<?php
require_once '../../database/db_connection.php';

function checkSession($conn) {
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
                $stmt->close();

                http_response_code(401);
                echo json_encode(array('logged_in' => false, 'message' => 'Session expired'));
                exit;
            } else {
                // Met à jour le login_time pour prolonger la session
                $sql = "UPDATE sessions SET login_time = CURRENT_TIMESTAMP WHERE session_id = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param('s', $session_id);
                $stmt->execute();
                $stmt->close();

                return $session;
            }
        } else {
            http_response_code(401);
            echo json_encode(array('logged_in' => false, 'message' => 'No active session'));
            exit;
        }
    } else {
        http_response_code(401);
        echo json_encode(array('logged_in' => false, 'message' => 'No session ID provided'));
        exit;
    }
}

function authorize($allowedRoles, $session) {
    if (!in_array($session['role'], $allowedRoles)) {
        http_response_code(403);
        echo json_encode(array('success' => false, 'message' => 'Access denied'));
        exit;
    }
}
?>
