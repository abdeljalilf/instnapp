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
authorize(['reception'], $user);

// Initialize the data array
$data = [];

// Define the queries
$queries = [
    'total_requests_3_months' => "
        SELECT COUNT(DISTINCT clients.id) AS total_requests 
        FROM clients 
        JOIN echantillons ON clients.id = echantillons.client_id
        JOIN analyses ON echantillons.id = analyses.echantillon_id 
        WHERE DATE(clients.requestingDate) >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH) 
          AND (analyses.departement = ? OR ? = 'INSTN')
    ",
    'reports_generated_3_months' => "
        SELECT COUNT(DISTINCT clients.id) AS reports_generated 
        FROM clients 
        JOIN echantillons ON clients.id = echantillons.client_id 
        JOIN analyses ON echantillons.id = analyses.echantillon_id 
        WHERE analyses.validated = 'office_step_3' 
          AND (analyses.departement = ? OR ? = 'INSTN')
          AND DATE(clients.requestingDate) >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
    ",
    'reports_pending_3_months' => "
        SELECT COUNT(DISTINCT clients.id) AS reports_pending 
        FROM clients 
        JOIN echantillons ON clients.id = echantillons.client_id 
        JOIN analyses ON echantillons.id = analyses.echantillon_id 
        WHERE (analyses.validated IS NULL OR analyses.validated != 'office_step_3') 
          AND (analyses.departement = ? OR ? = 'INSTN')
          AND DATE(clients.requestingDate) >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
    ",
    'sample_statistics_3_months' => "
        SELECT echantillons.sampleType, COUNT(*) AS count 
        FROM clients 
        JOIN echantillons ON clients.id = echantillons.client_id 
        JOIN analyses ON echantillons.id = analyses.echantillon_id 
        WHERE DATE(clients.requestingDate) >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
          AND (analyses.departement = ? OR ? = 'INSTN')
        GROUP BY echantillons.sampleType
    ",
    'analysis_statistics_3_months' => "
        SELECT analyses.analysisType, COUNT(*) AS count 
        FROM clients 
        JOIN echantillons ON clients.id = echantillons.client_id 
        JOIN analyses ON echantillons.id = analyses.echantillon_id 
        WHERE DATE(clients.requestingDate) >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
          AND (analyses.departement = ? OR ? = 'INSTN')
        GROUP BY analyses.analysisType
    ",
    'total_requests_year' => "
        SELECT COUNT(DISTINCT clients.id) AS total_requests 
        FROM clients 
        JOIN echantillons ON clients.id = echantillons.client_id
        JOIN analyses ON echantillons.id = analyses.echantillon_id 
        WHERE YEAR(clients.requestingDate) = YEAR(CURDATE()) 
          AND (analyses.departement = ? OR ? = 'INSTN')
    ",
    'reports_generated_year' => "
        SELECT COUNT(DISTINCT clients.id) AS reports_generated 
        FROM clients 
        JOIN echantillons ON clients.id = echantillons.client_id 
        JOIN analyses ON echantillons.id = analyses.echantillon_id 
        WHERE analyses.validated = 'office_step_3' 
          AND YEAR(clients.requestingDate) = YEAR(CURDATE())
          AND (analyses.departement = ? OR ? = 'INSTN')
    ",
    'reports_pending_year' => "
        SELECT COUNT(DISTINCT clients.id) AS reports_pending 
        FROM clients 
        JOIN echantillons ON clients.id = echantillons.client_id 
        JOIN analyses ON echantillons.id = analyses.echantillon_id 
        WHERE (analyses.validated IS NULL OR analyses.validated != 'office_step_3') 
          AND YEAR(clients.requestingDate) = YEAR(CURDATE())
          AND (analyses.departement = ? OR ? = 'INSTN')
    ",
    'sample_statistics_year' => "
        SELECT echantillons.sampleType, COUNT(*) AS count 
        FROM clients 
        JOIN echantillons ON clients.id = echantillons.client_id 
        JOIN analyses ON echantillons.id = analyses.echantillon_id 
        WHERE YEAR(clients.requestingDate) = YEAR(CURDATE())
          AND (analyses.departement = ? OR ? = 'INSTN')
        GROUP BY echantillons.sampleType
    ",
    'analysis_statistics_year' => "
        SELECT analyses.analysisType, COUNT(*) AS count 
        FROM clients 
        JOIN echantillons ON clients.id = echantillons.client_id 
        JOIN analyses ON echantillons.id = analyses.echantillon_id 
        WHERE YEAR(clients.requestingDate) = YEAR(CURDATE())
          AND (analyses.departement = ? OR ? = 'INSTN')
        GROUP BY analyses.analysisType
    ",
    'request_status' => "
        SELECT 
            'completed' AS status, COUNT(*) AS count 
        FROM clients 
        JOIN echantillons ON clients.id = echantillons.client_id 
        JOIN analyses ON echantillons.id = analyses.echantillon_id 
        WHERE analyses.validated = 'office_step_3' 
          AND (analyses.departement = ? OR ? = 'INSTN')
        UNION ALL
        SELECT 
            'pending_payment' AS status, COUNT(*) AS count 
        FROM clients 
        JOIN echantillons ON clients.id = echantillons.client_id 
        JOIN analyses ON echantillons.id = analyses.echantillon_id 
        WHERE analyses.validated IS NULL 
          AND (analyses.departement = ? OR ? = 'INSTN')
        UNION ALL
        SELECT 
            'awaiting_result_validation' AS status, COUNT(*) AS count 
        FROM clients 
        JOIN echantillons ON clients.id = echantillons.client_id 
        JOIN analyses ON echantillons.id = analyses.echantillon_id 
        WHERE analyses.validated = 'office_step_1' 
          AND (analyses.departement = ? OR ? = 'INSTN')
        UNION ALL
        SELECT 
            'pending_office_validation' AS status, COUNT(*) AS count 
        FROM clients 
        JOIN echantillons ON clients.id = echantillons.client_id 
        JOIN analyses ON echantillons.id = analyses.echantillon_id 
        WHERE analyses.validated = 'office_step_2' 
          AND (analyses.departement = ? OR ? = 'INSTN')
        UNION ALL
        SELECT 
            'in_analysis' AS status, COUNT(*) AS count 
        FROM clients 
        JOIN echantillons ON clients.id = echantillons.client_id 
        JOIN analyses ON echantillons.id = analyses.echantillon_id 
        WHERE analyses.validated IS NULL 
          AND (analyses.departement = ? OR ? = 'INSTN')
        UNION ALL
        SELECT 
            'awaiting_result_review' AS status, COUNT(*) AS count 
        FROM clients 
        JOIN echantillons ON clients.id = echantillons.client_id 
        JOIN analyses ON echantillons.id = analyses.echantillon_id 
        WHERE analyses.validated = 'office_step_3' 
          AND (analyses.departement = ? OR ? = 'INSTN')
    ",
    'monthly_requests' => "
        SELECT 
            DATE_FORMAT(clients.requestingDate, '%Y-%m') AS month, 
            COUNT(DISTINCT clients.id) AS total_requests 
        FROM clients 
        JOIN echantillons ON clients.id = echantillons.client_id 
        JOIN analyses ON echantillons.id = analyses.echantillon_id 
        WHERE (analyses.departement = ? OR ? = 'INSTN')
        GROUP BY month
        ORDER BY month DESC
    "
];

foreach ($queries as $key => $query) {
    try {
        $stmt = $conn->prepare($query);
        $stmt->bind_param("ss", $department, $department);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($key === 'sample_statistics_3_months' || $key === 'analysis_statistics_3_months' || 
            $key === 'sample_statistics_year' || $key === 'analysis_statistics_year' || 
            $key === 'monthly_requests') {
            $data[$key] = $result->fetch_all(MYSQLI_ASSOC);
        } else {
            $data[$key] = $result->fetch_assoc();
        }
        
        $stmt->close();
    } catch (Exception $e) {
        $data[$key] = ['error' => $e->getMessage()];
    }
}

echo json_encode($data);
?>
