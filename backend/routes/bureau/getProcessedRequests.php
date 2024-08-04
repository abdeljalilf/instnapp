<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

include '../../database/db_connection.php';

// Obtenez le paramètre 'department' de l'URL
$department = isset($_GET['department']) ? $_GET['department'] : 'TFXE'; // Valeur par défaut si non spécifié

// Préparez et exécutez la requête
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
               AND a.validated = 'laboratory'
           ) AS N1,
           (
               SELECT COUNT(*) 
               FROM analyses AS a
               WHERE a.echantillon_id IN (
                   SELECT id FROM echantillons WHERE client_id = clients.id
               )
           ) AS N2
    FROM clients 
    JOIN echantillons ON clients.id = echantillons.client_id 
    JOIN analyses ON echantillons.id = analyses.echantillon_id 
    WHERE analyses.validated = 'laboratory' AND analyses.departement = ?
";

$stmt = $conn->prepare($query);
if (!$stmt) {
    echo json_encode(['error' => 'Failed to prepare SQL query']);
    exit;
}

$stmt->bind_param("s", $department);
$stmt->execute();
$result = $stmt->get_result();

if (!$result) {
    echo json_encode(['error' => 'Failed to execute SQL query']);
    exit;
}

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

mysqli_close($conn);

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
            'N2' => $N2
        ];
    }

    if (!isset($groupedData[$demande_id]['samples'][$sampleType])) {
        $groupedData[$demande_id]['samples'][$sampleType] = [];
    }

    $groupedData[$demande_id]['samples'][$sampleType][] = $analysisType;
}

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
?>
