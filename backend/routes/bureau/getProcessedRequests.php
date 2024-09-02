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

// Préparez et exécutez la requête principale
$query = "
    SELECT clients.id AS demande_id, 
           clients.dilevery_delay, 
           clients.clientReference,
           echantillons.sampleType, 
           analyses.analysisType,
           (
               SELECT COUNT(*) 
               FROM analyses AS a
               WHERE a.echantillon_id IN (
                   SELECT id FROM echantillons WHERE client_id = clients.id
               ) 
               AND a.validated = 'laboratory' AND a.departement = ?
           ) AS N1,
           (
               SELECT COUNT(*) 
               FROM analyses AS a
               WHERE a.echantillon_id IN (
                   SELECT id FROM echantillons WHERE client_id = clients.id
               ) AND a.departement = ?
           ) AS N2
    FROM clients 
    JOIN echantillons ON clients.id = echantillons.client_id 
    JOIN analyses ON echantillons.id = analyses.echantillon_id 
    WHERE analyses.validated = 'laboratory' AND analyses.departement = ?
";

$stmt = $conn->prepare($query);
if (!$stmt) {
    echo json_encode(['error' => 'Failed to prepare SQL query: ' . $conn->error]);
    exit;
}

// Bind the department parameter for each placeholder
$stmt->bind_param("sss", $department, $department, $department);
$stmt->execute();
$result = $stmt->get_result();

if (!$result) {
    echo json_encode(['error' => 'Failed to execute SQL query: ' . $stmt->error]);
    exit;
}

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

// Regrouper les données par demande_id
$groupedData = [];
foreach ($data as $row) {
    $demande_id = $row['demande_id'];
    $sampleType = $row['sampleType'];
    $analysisType = $row['analysisType'];
    $N1 = $row['N1'];
    $N2 = $row['N2'];

    if (!isset($groupedData[$demande_id])) {
        $groupedData[$demande_id] = [
            'demande_id' => $demande_id,
            'dilevery_delay' => $row['dilevery_delay'],
            'clientReference' => $row['clientReference'],
            'samples' => [],
            'N1' => $N1,
            'N2' => $N2,
            'other_departments' => []
        ];
    }

    if (!isset($groupedData[$demande_id]['samples'][$sampleType])) {
        $groupedData[$demande_id]['samples'][$sampleType] = [];
    }

    $groupedData[$demande_id]['samples'][$sampleType][] = $analysisType;
}

// Ajouter les données pour les autres départements
$queryOthers = "
    SELECT analyses.departement, 
           COUNT(CASE WHEN analyses.validated = 'laboratory' THEN 1 END) AS N1, 
           COUNT(*) AS N2
    FROM analyses 
    JOIN echantillons ON analyses.echantillon_id = echantillons.id
    WHERE echantillons.client_id = ? AND analyses.departement != ?
    GROUP BY analyses.departement
";

$stmtOthers = $conn->prepare($queryOthers);
if (!$stmtOthers) {
    echo json_encode(['error' => 'Failed to prepare SQL query for other departments: ' . $conn->error]);
    exit;
}

foreach ($groupedData as &$request) {
    $demande_id = $request['demande_id'];

    $stmtOthers->bind_param("is", $demande_id, $department);
    $stmtOthers->execute();
    $resultOthers = $stmtOthers->get_result();

    while ($row = $resultOthers->fetch_assoc()) {
        $otherDepartment = $row['departement'];
        $N1 = $row['N1'];
        $N2 = $row['N2'];
        $request['other_departments'][] = "$otherDepartment : $N1 parmi $N2 analysés";
    }
}

$stmtOthers->close();

// Ajouter description et analyses_summary
foreach ($groupedData as &$request) {
    $description = [];
    foreach ($request['samples'] as $sampleType => $analysisTypes) {
        $description[] = $sampleType . ' : ' . implode(', ', $analysisTypes);
    }
    $request['description'] = implode("\n", $description);
    $request['analyses_summary'] = $request['N1'] . ' parmi ' . $request['N2']; // Résumé des analyses
}

header('Content-Type: application/json');
echo json_encode(array_values($groupedData), JSON_PRETTY_PRINT);

mysqli_close($conn); // Close the connection here, after all operations are complete
?>
