<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

include '../../database/db_connection.php';

// Get the department parameter from the URL
$department = isset($_GET['department']) ? $_GET['department'] : '';

// Prepare and execute query based on the department
$sql = "SELECT clients.id AS demande_id, clients.clientReference, clients.dilevery_delay, echantillons.sampleType, analyses.analysisType 
        FROM clients 
        JOIN echantillons ON clients.id = echantillons.client_id 
        JOIN analyses ON echantillons.id = analyses.echantillon_id 
        WHERE analyses.validated = 'office_step_2'";

if ($department) {
    $sql .= " AND analyses.departement = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $department); // Bind the department parameter
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $conn->query($sql);
}

$requests = array();

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $demande_id = $row['demande_id'];
        if (!isset($requests[$demande_id])) {
            $requests[$demande_id] = [
                'demande_id' => $demande_id,
                'dilevery_delay' => $row['dilevery_delay'],
                'clientReference' => $row['clientReference'],
                'samples' => []
            ];
        }
        $sampleType = $row['sampleType'];
        if (!isset($requests[$demande_id]['samples'][$sampleType])) {
            $requests[$demande_id]['samples'][$sampleType] = [];
        }
        $requests[$demande_id]['samples'][$sampleType][] = $row['analysisType'];
    }
}

echo json_encode(array_values($requests));

$conn->close();
?>
