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

function getDataThreeMonths($department, $conn) {
    $currentDate = date('Y-m-d');
    $threeMonthsAgo = date('Y-m-d', strtotime('-3 months'));

    $query = "
        SELECT
            COUNT(*) AS demandesTroisMois
        FROM
            clients
        WHERE
            requestingDate BETWEEN ? AND ?
    ";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ss", $threeMonthsAgo, $currentDate);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_assoc();
    $demandesTroisMois = $data['demandesTroisMois'];

    $query = "
        SELECT
            COUNT(*) AS rapportsGeneres
        FROM
            analyses
        WHERE
            validated = 'office_step_3'
            AND departement = ?
    ";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $department);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_assoc();
    $rapportsGeneres = $data['rapportsGeneres'];

    $query = "
        SELECT
            COUNT(*) AS rapportsAttente
        FROM
            analyses
        WHERE
            validated IN ('office_step_3', 'laboratory')
            AND departement = ?
    ";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $department);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_assoc();
    $rapportsAttente = $data['rapportsAttente'];

    $query = "
        SELECT
            sampleType,
            COUNT(*) AS count
        FROM
            echantillons
        GROUP BY
            sampleType
    ";
    $result = $conn->query($query);
    $echantillons = [];
    while ($row = $result->fetch_assoc()) {
        $echantillons[] = $row;
    }

    $query = "
        SELECT
            analysisType,
            COUNT(*) AS count
        FROM
            analyses
        GROUP BY
            analysisType
    ";
    $result = $conn->query($query);
    $analyses = [];
    while ($row = $result->fetch_assoc()) {
        $analyses[] = $row;
    }

    $query = "
        SELECT
            MONTH(requestingDate) AS month,
            COUNT(*) AS count
        FROM
            clients
        WHERE
            requestingDate BETWEEN ? AND ?
        GROUP BY
            MONTH(requestingDate)
    ";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ss", $threeMonthsAgo, $currentDate);
    $stmt->execute();
    $result = $stmt->get_result();
    $demandesParMois = [];
    while ($row = $result->fetch_assoc()) {
        $demandesParMois[] = $row;
    }

    $query = "
        SELECT
            SUM(CASE WHEN validated = 'reception_step_1' THEN 1 ELSE 0 END) AS enAttentePayement,
            SUM(CASE WHEN validated = 'finance' THEN 1 ELSE 0 END) AS enAttenteValidationBureau,
            SUM(CASE WHEN validated = 'office_step_1' THEN 1 ELSE 0 END) AS enCoursAnalyse,
            SUM(CASE WHEN validated IN ('laboratory', 'office_step_2') THEN 1 ELSE 0 END) AS enAttenteValidationResultats,
            SUM(CASE WHEN validated = 'office_step_3' THEN 1 ELSE 0 END) AS finies
        FROM
            analyses
        WHERE
            departement = ?
    ";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $department);
    $stmt->execute();
    $result = $stmt->get_result();
    $statusDemandes = $result->fetch_assoc();

    return [
        'demandesTroisMois' => $demandesTroisMois,
        'rapportsGeneres' => $rapportsGeneres,
        'rapportsAttente' => $rapportsAttente,
        'echantillons' => $echantillons,
        'analyses' => $analyses,
        'demandesParMois' => $demandesParMois,
        'statusDemandes' => $statusDemandes
    ];
}

function getDataYear($department, $conn) {
    $currentDate = date('Y-m-d');
    $startOfYear = date('Y-01-01');

    $query = "
        SELECT
            COUNT(*) AS demandesAnnee
        FROM
            clients
        WHERE
            requestingDate BETWEEN ? AND ?
    ";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ss", $startOfYear, $currentDate);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_assoc();
    $demandesAnnee = $data['demandesAnnee'];

    $query = "
        SELECT
            COUNT(*) AS rapportsGeneres
        FROM
            analyses
        WHERE
            validated = 'office_step_3'
            AND departement = ?
    ";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $department);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_assoc();
    $rapportsGeneres = $data['rapportsGeneres'];

    $query = "
        SELECT
            sampleType,
            COUNT(*) AS count
        FROM
            echantillons
        GROUP BY
            sampleType
    ";
    $result = $conn->query($query);
    $echantillons = [];
    while ($row = $result->fetch_assoc()) {
        $echantillons[] = $row;
    }

    $query = "
        SELECT
            analysisType,
            COUNT(*) AS count
        FROM
            analyses
        GROUP BY
            analysisType
    ";
    $result = $conn->query($query);
    $analyses = [];
    while ($row = $result->fetch_assoc()) {
        $analyses[] = $row;
    }

    return [
        'demandesAnnee' => $demandesAnnee,
        'rapportsGeneres' => $rapportsGeneres,
        'echantillons' => $echantillons,
        'analyses' => $analyses
    ];
}

$department = $_GET['department'] ?? 'TFXE'; // Définir un département par défaut

$dataThreeMonths = getDataThreeMonths($department, $conn);
$dataYear = getDataYear($department, $conn);

$response = array_merge($dataThreeMonths, $dataYear);

header('Content-Type: application/json');
echo json_encode($response);

$conn->close();
?>
