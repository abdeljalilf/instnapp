<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

include '../../database/db_connection.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $selectedLabo = $input['labo'];

    $stmt = $conn->prepare("
        SELECT 
            a.id AS analysisId, 
            e.sampleReference, 
            a.analysisType, 
            a.parameter, 
            a.technique,
            a.validated,
            GROUP_CONCAT(ed.elementDinteret SEPARATOR ', ') AS elementDinteret
        FROM 
            analyses a
        JOIN 
            echantillons e ON a.echantillon_id = e.id 
        LEFT JOIN 
            elementsdinteret ed ON a.id = ed.analysis_id
        WHERE 
            a.departement = ? 
            AND (a.validated = 'office_step_1' OR a.validated = 'office_reject')
        GROUP BY 
            a.id, e.sampleReference, a.analysisType, a.parameter, a.technique
    ");
    $stmt->bind_param("s", $selectedLabo);
    $stmt->execute();
    $result = $stmt->get_result();

    $analyses = [];
    while ($row = $result->fetch_assoc()) {
        $analyses[] = $row;
    }

    echo json_encode($analyses);
}

$conn->close();
?>
