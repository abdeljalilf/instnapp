<?php
//save_final_file_report.php
require_once '../../routes/login/session_util.php';
require_once '../../database/db_connection.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get the department parameter from the URL
$department = isset($_GET['department']) ? $_GET['department'] : '';

// Vérifiez la session
$user = checkSession($conn);
authorize(['bureau'], $user, $department);

// Read and process FormData
if (isset($_POST['client_id'])) {
    $client_id = intval($_POST['client_id']);
    if ($client_id > 0) {
        // Vérifiez que l'ID existe dans la table `clients`
        $query = "SELECT id FROM clients WHERE id = $client_id";
        $result = $conn->query($query);
        if (!$result || $result->num_rows === 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid client_id']);
            exit;
        }

        // Traitement des fichiers
        if (!empty($_FILES)) {
            $fileUploadSuccess = true;
            foreach ($_FILES as $fileKey => $file) {
                if ($file['error'] === UPLOAD_ERR_OK) {
                    $file_name = basename($file['name']);
                    $file_path = '../../fichiers_rapports/' . $file_name;

                    if (move_uploaded_file($file['tmp_name'], $file_path)) {
                        $file_name = $conn->real_escape_string($file_name);
                        $file_path = $conn->real_escape_string($file_path);

                        $query = "INSERT INTO fichiers_rapports (client_id, file_name, file_path) VALUES ($client_id, '$file_name', '$file_path')";
                        if (!$conn->query($query)) {
                            $fileUploadSuccess = false;
                            echo json_encode(['success' => false, 'message' => 'Error inserting file record: ' . $conn->error]);
                            exit;
                        }
                    } else {
                        $fileUploadSuccess = false;
                        echo json_encode(['success' => false, 'message' => 'Error moving uploaded file']);
                        exit;
                    }
                } else {
                    $fileUploadSuccess = false;
                    echo json_encode(['success' => false, 'message' => 'File upload error']);
                    exit;
                }
            }
            if ($fileUploadSuccess) {
                echo json_encode(['success' => true, 'message' => 'File(s) saved successfully']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'No files uploaded']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid client_id']);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Missing client_id']);
    exit;
}

?>
