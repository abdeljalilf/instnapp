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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (isset($data->email) && isset($data->password)) {
        $email = $data->email;
        $password = $data->password;

        // Requête SQL pour vérifier l'utilisateur
        $sql = "SELECT * FROM users WHERE email = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            $stored_password_hash = $user['password'];

            // Vérifier le mot de passe avec le hash stocké
            if (password_verify($password, $stored_password_hash)) {
                $session_id = bin2hex(random_bytes(32));
                $user_id = $user['id'];

                $sql = "INSERT INTO sessions (session_id, user_id, login_time) VALUES (?, ?, NOW())";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param('si', $session_id, $user_id);

                if ($stmt->execute()) {
                    $redirectUrl = '';
                    switch ($user['role']) {
                        case 'admin':
                            $redirectUrl = '/admin';
                            break;
                        case 'finance':
                            $redirectUrl = '/finance';
                            break;
                        case 'reception':
                            $redirectUrl = '/reception';
                            break;
                        case 'bureau':
                            $redirectUrl = '/bureau';
                            break;
                        case 'laboratoire':
                            $redirectUrl = '/laboratoire';
                            break;
                        default:
                            $redirectUrl = '/';
                            break;
                    }

                    echo json_encode(array(
                        'success' => true,
                        'message' => 'Login successful',
                        'session_id' => $session_id,
                        'user' => array(
                            'email' => $user['email'],
                            'role' => $user['role'],
                            'department' => $user['department']
                        ),
                        'redirectUrl' => $redirectUrl
                    ));
                } else {
                    echo json_encode(array('success' => false, 'message' => 'Failed to create session'));
                }
            } else {
                echo json_encode(array('success' => false, 'message' => 'Invalid password'));
            }
        } else {
            echo json_encode(array('success' => false, 'message' => 'User not found'));
        }

        $stmt->close();
    } else {
        echo json_encode(array('success' => false, 'message' => 'Invalid input'));
    }
}

$conn->close();
?>
