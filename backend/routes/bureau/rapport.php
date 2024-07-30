<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

include '../../database/db_connection.php';

// Verify if 'demande_id' and 'department' are set and valid
if (isset($_GET['demande_id']) && is_numeric($_GET['demande_id']) && isset($_GET['department'])) {
    $demande_id = intval($_GET['demande_id']);
    $department = $_GET['department']; // Get the department from the query string

    // Use a prepared statement with a placeholder
    $sql = "
        SELECT 
            clients.id AS demande_id, 
            clients.dilevery_delay, 
            clients.name AS client_name, 
            clients.address AS client_address,
            clients.requestingDate,
            clients.clientReference,
            echantillons.sampleType, 
            echantillons.sampleReference,
            echantillons.samplingLocation,
            echantillons.samplingDate,
            echantillons.sampledBy,
            analyses.analysisType,
            analyses.parameter,
            analyses.technique,
            elementsdinteret.elementDinteret,
            resultats.Unite,
            resultats.Valeur_Moyenne,
            resultats.Valeur_Limite_OMS,
            resultats.Limite_Detection,
            resultats.Observation
        FROM clients 
        JOIN echantillons ON clients.id = echantillons.client_id 
        JOIN analyses ON echantillons.id = analyses.echantillon_id 
        JOIN elementsdinteret ON analyses.id = elementsdinteret.analysis_id
        JOIN resultats ON elementsdinteret.id = resultats.elementsdinteret_id
        WHERE clients.id = ? AND analyses.departement = ?
    ";

    // Prepare and execute the query
    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("is", $demande_id, $department); // Bind the parameters $demande_id and $department
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $reports = array();
            while ($row = $result->fetch_assoc()) {
                if (!isset($reports[$demande_id])) {
                    $reports[$demande_id] = [
                        'demande_id' => $demande_id,
                        'dilevery_delay' => $row['dilevery_delay'],
                        'client_name' => $row['client_name'],
                        'client_address' => $row['client_address'],
                        'requestingDate' => $row['requestingDate'],
                        'clientReference' => $row['clientReference'],
                        'samples' => []
                    ];
                }
                $sampleType = strtolower($row['sampleType']); // Ensure consistent sample type keys
                if (!isset($reports[$demande_id]['samples'][$sampleType])) {
                    $reports[$demande_id]['samples'][$sampleType] = [];
                }
                $reports[$demande_id]['samples'][$sampleType][] = [
                    'sampleReference' => $row['sampleReference'],
                    'samplingLocation' => $row['samplingLocation'],
                    'samplingDate' => $row['samplingDate'],
                    'sampledBy' => $row['sampledBy'],
                    'analysisType' => $row['analysisType'],
                    'parameter' => $row['parameter'],
                    'technique' => $row['technique'],
                    'elementDinteret' => $row['elementDinteret'],
                    'Unite' => $row['Unite'],
                    'Valeur_Moyenne' => $row['Valeur_Moyenne'],
                    'Valeur_Limite_OMS' => $row['Valeur_Limite_OMS'],
                    'Limite_Detection' => $row['Limite_Detection'],
                    'Observation' => $row['Observation']
                ];
            }
            echo json_encode(array_values($reports), JSON_PRETTY_PRINT); // Output JSON with pretty print
        } else {
            echo json_encode(['error' => "No results found for ID: " . $demande_id]);
        }
        $stmt->close();
    } else {
        echo json_encode(['error' => 'Failed to prepare SQL statement']);
    }
} else {
    echo json_encode(['error' => 'Invalid demande_id or department']);
}

$conn->close();
?>
