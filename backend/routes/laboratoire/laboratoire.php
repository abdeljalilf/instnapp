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
authorize(['laboratoire'], $user, $department);

// Prepare and execute query based on the department
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

$stmt->bind_param("s", $department);
$stmt->execute();
$result = $stmt->get_result();

$analyses = [];
while ($row = $result->fetch_assoc()) {
    $analyses[] = $row;
}

echo json_encode($analyses);
$conn->close();
?>
