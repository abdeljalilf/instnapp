<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

include '../db/db_connection.php';

$sql = "SELECT clients.id AS demande_id, clients.delais_livraison, echantillons.sampleType, analyses.analysisType 
        FROM clients 
        JOIN echantillons ON clients.id = echantillons.client_id 
        JOIN analyses ON echantillons.id = analyses.echantillon_id 
        WHERE clients.validated = 'notvalid'";

$result = $conn->query($sql);

$requests = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $requests[] = $row;
    }
}

echo json_encode($requests);

$conn->close();
?>
