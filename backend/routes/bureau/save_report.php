<?php
// Autoriser les requêtes CORS
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Vérifier la méthode HTTP OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Inclure la connexion à la base de données
include '../../database/db_connection.php';

// Récupérer les données JSON envoyées par le client
$inputData = json_decode(file_get_contents('php://input'), true);

if (!isset($inputData['usedNormes']) || !is_array($inputData['usedNormes'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input data']);
    exit();
}

$usedNormes = $inputData['usedNormes'];
$success = true;

foreach ($usedNormes as $normeData) {
    $analysis_id = $normeData['analysis_id'];
    $used_norme = $normeData['Used_norme'];

    // Mettre à jour la norme utilisée pour chaque analyse dans la base de données
    $stmt = $conn->prepare("UPDATE analyses SET Used_norme = ? WHERE id = ?");
    $stmt->bind_param("si", $used_norme, $analysis_id);

    if (!$stmt->execute()) {
        $success = false;
        break;
    }
}

$stmt->close();
$conn->close();

if ($success) {
    echo json_encode(['success' => true, 'message' => 'Normes utilisées enregistrées avec succès']);
} else {
    echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'enregistrement des normes utilisées']);
}
?>
