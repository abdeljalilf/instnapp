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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $user = checkSession($conn); // Get the session and user details
    

    $oldPassword = $data->oldPassword ?? null;
    $newPassword = $data->newPassword ?? null;
    $confirmPassword = $data->confirmPassword ?? null;

    if (!$oldPassword || !$newPassword || !$confirmPassword) {
        echo json_encode(array('success' => false, 'message' => 'Tous les champs sont obligatoires'));
        exit;
    }

    if ($newPassword !== $confirmPassword) {
        echo json_encode(array('success' => false, 'message' => 'Mots de passe différents'));
        exit;
    }

    // Get the current password hash for the logged-in user
    $sql = "SELECT password FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $user['email']); // Use 's' for string
    $stmt->execute();
    $result = $stmt->get_result();
    $userPassword = $result->fetch_assoc();

    if ($userPassword) {
        // Verify the old password
        if (password_verify($oldPassword, $userPassword['password'])) {
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

            // Update the password in the database
            $sql = "UPDATE users SET password = ? WHERE email = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('ss', $hashedPassword, $user['email']); // Use 'ss' for two strings

            if ($stmt->execute()) {
                echo json_encode(array('success' => true, 'message' => 'Password changed successfully.'));
            } else {
                echo json_encode(array('success' => false, 'message' => 'Erreur dans le changement de mot de passe.'));
            }
        } else {
            echo json_encode(array('success' => false, 'message' => 'Ancien mot de passe incorrect.'));
        }
    } else {
        echo json_encode(array('success' => false, 'message' => 'Utilisateur non trouvé.'));
    }

    $stmt->close();
}

$conn->close();
?>
