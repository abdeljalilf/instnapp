<?php
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
            foreach ($_FILES as $fileKey => $file) {
                if ($file['error'] === UPLOAD_ERR_OK) {
                    $file_name = basename($file['name']);
                    $filePath_stocke = 'instnapp/backend/fichiers_rapports/' . $file_name;
                    $file_path = '../../fichiers_rapports/' . $file_name;

                    if (move_uploaded_file($file['tmp_name'], $file_path)) {
                        $file_name = $conn->real_escape_string('premiere_version_'.$file_name);
                        $file_path = $conn->real_escape_string($file_path);

                        $query = "INSERT INTO fichiers_rapports (client_id, file_name, file_path) VALUES ($client_id, '$file_name', '$filePath_stocke')";
                        if (!$conn->query($query)) {
                            echo json_encode(['success' => false, 'message' => 'Error inserting file record: ' . $conn->error]);
                            exit;
                        }
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Error moving uploaded file']);
                        exit;
                    }
                } else {
                    echo json_encode(['success' => false, 'message' => 'File upload error']);
                    exit;
                }
            }
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid client_id']);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Missing client_id']);
    exit;
}


// Read JSON data
$data = json_decode($_POST['reportData'] ?? '{}', true);
if ($data === null) {
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
    exit;
}

// Process usedNormes
foreach ($data['usedNormes'] ?? [] as $norme) {
    $analysis_id = intval($norme['analysis_id']);
    $Used_norme = $conn->real_escape_string($norme['Used_norme']);

    $query = "UPDATE analyses SET Used_norme = '$Used_norme' WHERE id = $analysis_id";
    if (!$conn->query($query)) {
        echo json_encode(['success' => false, 'message' => 'Error updating analyses: ' . $conn->error]);
        exit;
    }
}

// Process validated field in analyses
foreach ($data['allAnalysisIds'] ?? [] as $analysis_id) {  
    $query = "UPDATE analyses SET validated = 'office_step_2' WHERE id = $analysis_id";
    if (!$conn->query($query)) {
        echo json_encode(['success' => false, 'message' => 'Error updating analyses validated field: ' . $conn->error]);
        exit;
    }
}

// Process normeValues
foreach ($data['normeValues'] ?? [] as $value) {
    $element_id = intval($value['element_id']);
    $Valeur_Norme_Utlise = $conn->real_escape_string($value['Valeur_Norme_Utlise']);

    $query = "SELECT id FROM resultats WHERE elementsdinteret_id = $element_id ORDER BY id DESC LIMIT 1";
    $result = $conn->query($query);
    if ($result && $row = $result->fetch_assoc()) {
        $result_id = $row['id'];
        $updateQuery = "UPDATE resultats SET Valeur_Norme_Utlise = '$Valeur_Norme_Utlise' WHERE id = $result_id";
        if (!$conn->query($updateQuery)) {
            echo json_encode(['success' => false, 'message' => 'Error updating resultats: ' . $conn->error]);
            exit;
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Element ID not found in resultats']);
        exit;
    }
}

// Process observations
foreach ($data['observations'] ?? [] as $observation) {
    $element_id = intval($observation['element_id']);
    $Observation = $conn->real_escape_string($observation['Observation']);

    $query = "SELECT id FROM resultats WHERE elementsdinteret_id = $element_id ORDER BY id DESC LIMIT 1";
    $result = $conn->query($query);
    if ($result && $row = $result->fetch_assoc()) {
        $result_id = $row['id'];
        $updateQuery = "UPDATE resultats SET Observation = '$Observation' WHERE id = $result_id";
        if (!$conn->query($updateQuery)) {
            echo json_encode(['success' => false, 'message' => 'Error updating resultats: ' . $conn->error]);
            exit;
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Element ID not found in resultats']);
        exit;
    }
}

// Process conclusion
if (!empty($data['conclusion'])) {
    $client_id = intval($data['client_id']);
    $departement = $conn->real_escape_string($data['departement']);
    $conclusion = $conn->real_escape_string($data['conclusion']);

    $query = "INSERT INTO conclusions (client_id, departement, conclusion) VALUES ($client_id, '$departement', '$conclusion')";
    if (!$conn->query($query)) {
        echo json_encode(['success' => false, 'message' => 'Error inserting conclusion: ' . $conn->error]);
        exit;
    }
}

// Final response
echo json_encode(['success' => true, 'message' => 'Data and file saved successfully']);
?>
