<?php
require_once '../../routes/login/session_util.php';
require_once '../../database/db_connection.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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

// Obtenir les données des demandes, rapports et statistiques
function getDashboardData($conn, $department) {
    $data = [];

    // Nombre de demandes reçues sur les trois derniers mois
    $query = "
        SELECT COUNT(*) AS count 
        FROM clients 
        WHERE requestingDate >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
    ";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $data['demandes_recues']['recent'] = $row['count'];

    // Nombre de demandes reçues sur l'année
    $query = "
        SELECT COUNT(*) AS count 
        FROM clients 
        WHERE requestingDate >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
    ";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $data['demandes_recues']['year'] = $row['count'];

    // Nombre de rapports générés sur les trois derniers mois
    $query = "
        SELECT COUNT(DISTINCT client_id) AS count 
        FROM echantillons 
        JOIN analyses ON echantillons.id = analyses.echantillon_id
        WHERE analyses.departement = ? 
        AND echantillons.samplingDate >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
    ";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('s', $department);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $data['rapports_generes']['recent'] = $row['count'];

    // Nombre de rapports générés sur l'année
    $query = "
        SELECT COUNT(DISTINCT client_id) AS count 
        FROM echantillons 
        JOIN analyses ON echantillons.id = analyses.echantillon_id
        WHERE analyses.departement = ? 
        AND echantillons.samplingDate >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
    ";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('s', $department);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $data['rapports_generes']['year'] = $row['count'];

    // Nombre de rapports en attente sur les trois derniers mois
    $query = "
        SELECT COUNT(DISTINCT client_id) AS count 
        FROM echantillons 
        JOIN analyses ON echantillons.id = analyses.echantillon_id
        WHERE analyses.departement = ? 
        AND (analyses.validated = 'office_step_3' OR analyses.validated = 'laboratory') 
        AND echantillons.samplingDate >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
    ";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('s', $department);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $data['rapports_en_attente']['recent'] = $row['count'];

    // Statistiques sur les échantillons par type
    $query = "
        SELECT sampleType, COUNT(*) AS count 
        FROM echantillons 
        JOIN analyses ON echantillons.id = analyses.echantillon_id
        WHERE analyses.departement = ?
        GROUP BY sampleType
    ";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('s', $department);
    $stmt->execute();
    $result = $stmt->get_result();
    $data['echantillons_par_type']['recent'] = [];
    $data['echantillons_par_type']['year'] = [];
    while ($row = $result->fetch_assoc()) {
        $data['echantillons_par_type']['recent'][] = $row;
        $data['echantillons_par_type']['year'][] = $row;
    }

    // Statistiques sur les analyses par type
    $query = "
        SELECT analysisType, COUNT(*) AS count 
        FROM analyses 
        WHERE departement = ? 
        GROUP BY analysisType
    ";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('s', $department);
    $stmt->execute();
    $result = $stmt->get_result();
    $data['analyses_par_type']['recent'] = [];
    $data['analyses_par_type']['year'] = [];
    while ($row = $result->fetch_assoc()) {
        $data['analyses_par_type']['recent'][] = $row;
        $data['analyses_par_type']['year'][] = $row;
    }

    // Graphes des demandes par mois
    $query = "
        SELECT MONTH(samplingDate) AS month, COUNT(*) AS count 
        FROM echantillons 
        JOIN analyses ON echantillons.id = analyses.echantillon_id
        WHERE analyses.departement = ?
        GROUP BY MONTH(samplingDate)
    ";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('s', $department);
    $stmt->execute();
    $result = $stmt->get_result();
    $data['demandes_par_mois'] = [];
    while ($row = $result->fetch_assoc()) {
        $data['demandes_par_mois'][] = $row;
    }

    // Status des demandes
    $query = "
        SELECT 
            SUM(CASE WHEN validated = 'reception_step_1' THEN 1 ELSE 0 END) AS enAttenteDePaiement,
            SUM(CASE WHEN validated = 'finance' THEN 1 ELSE 0 END) AS enAttenteDeValidationBureau,
            SUM(CASE WHEN validated = 'office_step_1' THEN 1 ELSE 0 END) AS enCoursAnalyse,
            SUM(CASE WHEN validated IN ('laboratory', 'office_step_2') THEN 1 ELSE 0 END) AS enAttenteDeValidationResultats,
            SUM(CASE WHEN validated = 'office_step_3' THEN 1 ELSE 0 END) AS finies
        FROM analyses 
        WHERE departement = ?
    ";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('s', $department);
    $stmt->execute();
    $result = $stmt->get_result();
    $data['status_demandes'] = $result->fetch_assoc();

    return $data;
}

$data = getDashboardData($conn, $department);

// Retourner les données en JSON
echo json_encode($data);

$conn->close();
?>
