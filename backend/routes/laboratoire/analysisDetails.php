<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Include database connection
include '../../database/db_connection.php';
include '../../routes/login/session_util.php';
function sendErrorResponse($message) {
    echo json_encode(['error' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
$department = isset($_GET['department']) ? $_GET['department'] : '';
$id = intval($_GET['id']);
// Vérifiez la session
$user = checkSession($conn);
authorize(['laboratoire'], $user, $department);



if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = intval($_GET['id']); // Sanitize input

    // Query to fetch details from analyses
    $query = $conn->prepare("SELECT * FROM analyses WHERE id = ?");
    if ($query === false) {
        sendErrorResponse('Failed to prepare query: ' . $conn->error);
    }
    $query->bind_param("i", $id);
    $query->execute();
    $result = $query->get_result();
    $analysis = $result->fetch_assoc();

    if ($analysis) {
        // Query to fetch elements d'interet with their IDs
        $query = $conn->prepare("SELECT id, elementDinteret FROM elementsdinteret WHERE analysis_id = ?");
        if ($query === false) {
            sendErrorResponse('Failed to prepare query: ' . $conn->error);
        }
        $query->bind_param("i", $id);
        $query->execute();
        $result = $query->get_result();
        $elements = [];
        while ($row = $result->fetch_assoc()) {
            $elements[] = [
                'id' => $row['id'],
                'elementDinteret' => $row['elementDinteret']
            ];
        }

        // Query to fetch sample details
        $query = $conn->prepare("SELECT * FROM echantillons WHERE id = ?");
        if ($query === false) {
            sendErrorResponse('Failed to prepare query: ' . $conn->error);
        }
        $query->bind_param("i", $analysis['echantillon_id']);
        $query->execute();
        $result = $query->get_result();
        $sample = $result->fetch_assoc();

        // Combine all data into a single array
        $details = array_merge($analysis, [
            'elementsdinteret' => $elements,
            'sampleType' => $sample['sampleType'] ?? null,
            'samplingLocation' => $sample['samplingLocation'] ?? null,
            'samplingDate' => $sample['samplingDate'] ?? null,
            'sampleReference' => $sample['sampleReference'] ?? null
        ]);

        echo json_encode($details);
    } else {
        sendErrorResponse('Analysis not found');
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Handle file upload
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['file']['tmp_name'];
        $fileName = $_FILES['file']['name'];
        $filePath_stocke = 'instnapp/backend/fichiers_resultats/' . $fileName;
        $filePath = '../../fichiers_resultats/' . $fileName;

        // Move the uploaded file to the uploads directory
        if (move_uploaded_file($fileTmpPath, $filePath)) {
            // Prepare the SQL statement for inserting the file info
            $stmt = $conn->prepare("
                INSERT INTO fichiers_resultats (analysis_id, file_name, file_path)
                VALUES (?, ?, ?);
            ");
            if ($stmt === false) {
                sendErrorResponse('Failed to prepare insert query: ' . $conn->error);
            }
            $analysisId = isset($_POST['analysisId']) ? intval($_POST['analysisId']) : null;
            $stmt->bind_param("iss", $analysisId, $fileName, $filePath_stocke);
            $stmt->execute();
        } else {
            sendErrorResponse('File upload failed');
        }
    }

    // Handle other POST data (results and qualite)
    $data = json_decode($_POST['data'], true);

    if ($data) {
        $analysisId = isset($_POST['analysisId']) ? intval($_POST['analysisId']) : null;
        $analyseTime = isset($_POST['analyseTime']) ? $_POST['analyseTime'] : '';
        $results = $data['results'];
        $qualite = isset($data['qualite']) && is_array($data['qualite']) ? $data['qualite'] : [];

        // Prepare the SQL statement for inserting/updating results in the resultats table
        $stmt = $conn->prepare("
            INSERT INTO resultats (elementsdinteret_id, Unite, Valeur_Moyenne, Limite_Detection, Incertitude)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            Unite = VALUES(Unite),
            Valeur_Moyenne = VALUES(Valeur_Moyenne),
            Limite_Detection = VALUES(Limite_Detection),
            Incertitude = VALUES(Incertitude);
        ");

        if ($stmt === false) {
            sendErrorResponse('Failed to prepare insert query for results: ' . $conn->error);
        }

        foreach ($results as $result) {
            $elementsdinteretId = intval($result['elementsdinteretId']);
            $unite = $result['unite'];
            $valeurMoyenne = $result['valeurMoyenne'];
            $limiteDetection = $result['limiteDetection'];
            $incertitude = $result['incertitude'];

            // Bind the parameters
            $stmt->bind_param("issss", $elementsdinteretId, $unite, $valeurMoyenne, $limiteDetection, $incertitude);
            $stmt->execute();
        }

        // Prepare the SQL statement for inserting/updating results in the analyse_qualite table
        $qualityStmt = $conn->prepare("
            INSERT INTO analyse_qualite (elementsdinteret_id, Reference_Materiel, Valeur_Recommandee, Valeur_Mesuree)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            Reference_Materiel = VALUES(Reference_Materiel),
            Valeur_Recommandee = VALUES(Valeur_Recommandee),
            Valeur_Mesuree = VALUES(Valeur_Mesuree);
        ");

        if ($qualityStmt === false) {
            sendErrorResponse('Failed to prepare insert query for quality: ' . $conn->error);
        }

        foreach ($qualite as $qualityResult) {
            $elementsdinteretId = intval($qualityResult['elementsdinteretId']);
            $referenceMateriel = $qualityResult['referenceMateriel'];
            $valeurRecommandee = $qualityResult['valeurRecommandee'];
            $valeurMesuree = $qualityResult['valeurMesuree'];

            // Bind the parameters
            $qualityStmt->bind_param("isss", $elementsdinteretId, $referenceMateriel, $valeurRecommandee, $valeurMesuree);
            $qualityStmt->execute();
        }

        // Update the validated column and analyse_time in analyses table
        $updateQuery = $conn->prepare("UPDATE analyses SET validated = 'laboratory', analyse_time = ? WHERE id = ?");
        if ($updateQuery === false) {
            sendErrorResponse('Failed to prepare update query: ' . $conn->error);
        }
        $updateQuery->bind_param("si", $analyseTime, $analysisId);
        $updateQuery->execute();

        // Return success message
        echo json_encode(['message' => 'Results and file saved successfully']);
    } else {
        sendErrorResponse('No data to save');
    }
} else {
    sendErrorResponse('Invalid request method');
}
?>
