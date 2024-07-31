<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

include '../../database/db_connection.php';

// Obtenez le paramètre 'department' de l'URL
$department = isset($_GET['department']) ? $_GET['department'] : 'TFXE'; // Valeur par défaut si non spécifié

$query = "
    SELECT clients.id AS demande_id, clients.dilevery_delay, echantillons.sampleType, analyses.analysisType 
    FROM clients 
    JOIN echantillons ON clients.id = echantillons.client_id 
    JOIN analyses ON echantillons.id = analyses.echantillon_id 
    WHERE analyses.validated = 'laboratory' AND analyses.departement = ?
";

$stmt = $conn->prepare($query);
$stmt->bind_param("s", $department); // Bind le paramètre 'department'
$stmt->execute();
$result = $stmt->get_result();

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

    if (!isset($groupedData[$demande_id])) {
        $groupedData[$demande_id] = [
            'demande_id' => $demande_id,
            'dilevery_delay' => $row['dilevery_delay'],
            'samples' => []
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
}

header('Content-Type: application/json');
echo json_encode(array_values($groupedData));
?>