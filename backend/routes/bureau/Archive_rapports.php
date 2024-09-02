<?php
// Archive_resultats.php
require_once '../../routes/login/session_util.php';
require_once '../../database/db_connection.php'; // Inclure la connexion à la base de données

// En-têtes CORS
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
// Gérer les requêtes OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}
$department = isset($_GET['department']) ? $_GET['department'] : '';
// Vérifiez la session
$user = checkSession($conn);
authorize(['bureau'], $user, $department);

// Vérifier si un file_id est fourni pour le téléchargement
if (isset($_GET['file_id'])) {
    $file_id = intval($_GET['file_id']);

    // Préparer la requête pour obtenir les informations du fichier
    $sql = "SELECT file_name, file_path FROM fichiers_rapports WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $file_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $file = $result->fetch_assoc();
        $file_path = $file['file_path'];
        $file_name = $file['file_name'];

        // Vérifier si le fichier existe avant de l'envoyer
        if (file_exists($file_path)) {
            header('Content-Description: File Transfer');
            header('Content-Type: application/octet-stream');
            header('Content-Disposition: attachment; filename="' . basename($file_name) . '"');
            header('Expires: 0');
            header('Cache-Control: must-revalidate');
            header('Pragma: public');
            header('Content-Length: ' . filesize($file_path));
            flush(); // Vider le tampon de sortie
            readfile($file_path);
            exit;
        } else {
            echo json_encode(['success' => false, 'message' => 'File does not exist.']);
            exit;
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid file ID.']);
        exit;
    }
}

// Si aucun file_id n'est fourni, récupérer et afficher les données des fichiers
$sql = "SELECT fr.id, fr.file_name, fr.file_path, fr.uploaded_at, 
               c.id AS client_id, c.clientReference,
               e.id AS sample_id, e.sampleReference, e.sampleType
        FROM fichiers_rapports fr
        JOIN clients c ON fr.client_id = c.id
        JOIN echantillons e ON e.client_id = c.id";
$result = $conn->query($sql);

if ($result === false) {
    echo json_encode(['success' => false, 'message' => 'Database query failed.']);
    exit;
}

$files = [];
while ($row = $result->fetch_assoc()) {
    $files[] = $row;
}

echo json_encode(['success' => true, 'data' => $files]);
?>
