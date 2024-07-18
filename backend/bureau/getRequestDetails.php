<?php
include '../db/db_connection.php';
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
$id = intval($_GET['id']);

$sql = "SELECT 
            clients.id AS demande_id, 
            clients.name, 
            clients.address, 
            clients.phone, 
            clients.email, 
            clients.validated,
            clients.delais_livraison,
            echantillons.id AS echantillon_id,
            echantillons.sampleType, 
            echantillons.samplingLocation, 
            echantillons.samplingDate, 
            echantillons.sampledBy,
            analyses.id AS analyse_id,
            analyses.analysisType, 
            analyses.parameter, 
            analyses.technique
        FROM clients
        JOIN echantillons ON clients.id = echantillons.client_id
        JOIN analyses ON echantillons.id = analyses.echantillon_id
        WHERE clients.id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

// Récupérer toutes les lignes de résultats
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);

$conn->close();
?>
