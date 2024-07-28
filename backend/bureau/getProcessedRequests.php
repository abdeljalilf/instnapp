<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

include '../db/db_connection.php';

$query = "
    SELECT clients.id AS demande_id, clients.delais_livraison, echantillons.sampleType, analyses.analysisType 
    FROM clients 
    JOIN echantillons ON clients.id = echantillons.client_id 
    JOIN analyses ON echantillons.id = analyses.echantillon_id 
    WHERE analyses.validated = 'analysed' AND analyses.departement = 'TFXE'
";

$result = mysqli_query($conn, $query);
$data = [];

while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}

mysqli_close($conn);

// Group the data by demande_id
$groupedData = [];
foreach ($data as $row) {
    $demande_id = $row['demande_id'];
    $sampleType = $row['sampleType'];
    $analysisType = $row['analysisType'];

    if (!isset($groupedData[$demande_id])) {
        $groupedData[$demande_id] = [
            'demande_id' => $demande_id,
            'delais_livraison' => $row['delais_livraison'],
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
