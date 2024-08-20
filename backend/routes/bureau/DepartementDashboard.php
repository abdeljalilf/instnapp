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
authorize(['bureau'], $user, $department);

// Initialize the data array
$data = [];

// Fetch the total number of requests for the past three months
$query1 = "
    SELECT COUNT(DISTINCT clients.id) AS total_requests 
    FROM clients 
    JOIN echantillons ON clients.id = echantillons.client_id
    JOIN analyses ON echantillons.id = analyses.echantillon_id 
    WHERE DATE(clients.requestingDate) >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH) 
      AND analyses.departement = ?
";
$stmt1 = $conn->prepare($query1);
$stmt1->bind_param("s", $department);
$stmt1->execute();
$result1 = $stmt1->get_result();
$data['total_requests_3_months'] = $result1->fetch_assoc()['total_requests'] ?? 0;
$stmt1->close();

// Fetch the number of generated reports for the past three months
$query2 = "
    SELECT COUNT(DISTINCT clients.id) AS reports_generated 
    FROM clients 
    JOIN echantillons ON clients.id = echantillons.client_id 
    JOIN analyses ON echantillons.id = analyses.echantillon_id 
    WHERE analyses.validated = 'office_step_3' 
      AND analyses.departement = ?
      AND DATE(clients.requestingDate) >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
";
$stmt2 = $conn->prepare($query2);
$stmt2->bind_param("s", $department);
$stmt2->execute();
$result2 = $stmt2->get_result();
$data['reports_generated_3_months'] = $result2->fetch_assoc()['reports_generated'] ?? 0;
$stmt2->close();

// Fetch the number of pending reports for the past three months
$query3 = "
    SELECT COUNT(DISTINCT clients.id) AS reports_pending 
    FROM clients 
    JOIN echantillons ON clients.id = echantillons.client_id 
    JOIN analyses ON echantillons.id = analyses.echantillon_id 
    WHERE (analyses.validated = 'office_step_2' OR analyses.validated = 'laboratory') 
      AND analyses.departement = ?
      AND DATE(clients.requestingDate) >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
";
$stmt3 = $conn->prepare($query3);
$stmt3->bind_param("s", $department);
$stmt3->execute();
$result3 = $stmt3->get_result();
$data['reports_pending_3_months'] = $result3->fetch_assoc()['reports_pending'] ?? 0;
$stmt3->close();

// Fetch sample statistics for the past three months
$query4 = "
    SELECT echantillons.sampleType, COUNT(*) AS count 
    FROM echantillons 
    JOIN analyses ON echantillons.id = analyses.echantillon_id 
    JOIN clients ON echantillons.client_id = clients.id
    WHERE analyses.departement = ?
    AND DATE(clients.requestingDate) >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
    GROUP BY echantillons.sampleType
";
$stmt4 = $conn->prepare($query4);
$stmt4->bind_param("s", $department);
$stmt4->execute();
$result4 = $stmt4->get_result();
$sample_statistics_3_months = [];
while ($row = $result4->fetch_assoc()) {
    $sample_statistics_3_months[] = $row;
}
$data['sample_statistics_3_months'] = $sample_statistics_3_months;
$stmt4->close();

// Fetch analysis statistics for the past three months
$query5 = "
    SELECT analyses.analysisType, COUNT(*) AS count 
    FROM analyses 
    JOIN echantillons ON echantillons.id = analyses.echantillon_id 
    JOIN clients ON echantillons.client_id = clients.id
    WHERE analyses.departement = ?
    AND DATE(clients.requestingDate) >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
    GROUP BY analyses.analysisType
";
$stmt5 = $conn->prepare($query5);
$stmt5->bind_param("s", $department);
$stmt5->execute();
$result5 = $stmt5->get_result();
$analysis_statistics_3_months = [];
while ($row = $result5->fetch_assoc()) {
    $analysis_statistics_3_months[] = $row;
}
$data['analysis_statistics_3_months'] = $analysis_statistics_3_months;
$stmt5->close();

// Fetch yearly statistics

// Fetch the total number of requests for the year
$query6 = "
    SELECT COUNT(DISTINCT clients.id) AS total_requests 
    FROM clients 
    JOIN echantillons ON clients.id = echantillons.client_id
    JOIN analyses ON echantillons.id = analyses.echantillon_id 
    WHERE YEAR(clients.requestingDate) = YEAR(CURDATE()) 
      AND analyses.departement = ?
";
$stmt6 = $conn->prepare($query6);
$stmt6->bind_param("s", $department);
$stmt6->execute();
$result6 = $stmt6->get_result();
$data['total_requests_year'] = $result6->fetch_assoc()['total_requests'] ?? 0;
$stmt6->close();

// Fetch the number of generated reports for the year
$query7 = "
    SELECT COUNT(DISTINCT clients.id) AS reports_generated 
    FROM clients 
    JOIN echantillons ON clients.id = echantillons.client_id 
    JOIN analyses ON echantillons.id = analyses.echantillon_id 
    WHERE analyses.validated = 'office_step_3' 
      AND analyses.departement = ?
      AND YEAR(clients.requestingDate) = YEAR(CURDATE())
";
$stmt7 = $conn->prepare($query7);
$stmt7->bind_param("s", $department);
$stmt7->execute();
$result7 = $stmt7->get_result();
$data['reports_generated_year'] = $result7->fetch_assoc()['reports_generated'] ?? 0;
$stmt7->close();

// Fetch the number of pending reports for the year
$query8 = "
    SELECT COUNT(DISTINCT clients.id) AS reports_pending 
    FROM clients 
    JOIN echantillons ON clients.id = echantillons.client_id 
    JOIN analyses ON echantillons.id = analyses.echantillon_id 
    WHERE (analyses.validated = 'office_step_2' OR analyses.validated = 'laboratory') 
      AND analyses.departement = ?
      AND YEAR(clients.requestingDate) = YEAR(CURDATE())
";
$stmt8 = $conn->prepare($query8);
$stmt8->bind_param("s", $department);
$stmt8->execute();
$result8 = $stmt8->get_result();
$data['reports_pending_year'] = $result8->fetch_assoc()['reports_pending'] ?? 0;
$stmt8->close();

// Fetch sample statistics for the year
$query9 = "
    SELECT echantillons.sampleType, COUNT(*) AS count 
    FROM echantillons 
    JOIN analyses ON echantillons.id = analyses.echantillon_id 
    JOIN clients ON echantillons.client_id = clients.id
    WHERE analyses.departement = ?
    AND YEAR(clients.requestingDate) = YEAR(CURDATE())
    GROUP BY echantillons.sampleType
";
$stmt9 = $conn->prepare($query9);
$stmt9->bind_param("s", $department);
$stmt9->execute();
$result9 = $stmt9->get_result();
$sample_statistics_year = [];
while ($row = $result9->fetch_assoc()) {
    $sample_statistics_year[] = $row;
}
$data['sample_statistics_year'] = $sample_statistics_year;
$stmt9->close();

// Fetch analysis statistics for the year
$query10 = "
    SELECT analyses.analysisType, COUNT(*) AS count 
    FROM analyses 
    JOIN echantillons ON echantillons.id = analyses.echantillon_id 
    JOIN clients ON echantillons.client_id = clients.id
    WHERE analyses.departement = ?
    AND YEAR(clients.requestingDate) = YEAR(CURDATE())
    GROUP BY analyses.analysisType
";
$stmt10 = $conn->prepare($query10);
$stmt10->bind_param("s", $department);
$stmt10->execute();
$result10 = $stmt10->get_result();
$analysis_statistics_year = [];
while ($row = $result10->fetch_assoc()) {
    $analysis_statistics_year[] = $row;
}
$data['analysis_statistics_year'] = $analysis_statistics_year;
$stmt10->close();

// Calculate the start date: 13 months ago from the current month
$startDate = date('Y-m-01', strtotime('-13 months'));

// Get the earliest request date from the database
$earliestQuery = "
    SELECT DATE_FORMAT(MIN(requestingDate), '%Y-%m') AS earliest_date
    FROM clients
    JOIN echantillons ON clients.id = echantillons.client_id
    JOIN analyses ON echantillons.id = analyses.echantillon_id 
    WHERE analyses.departement = ?
";
$stmtEarliest = $conn->prepare($earliestQuery);
$stmtEarliest->bind_param("s", $department);
$stmtEarliest->execute();
$earliestResult = $stmtEarliest->get_result();
$earliestDateRow = $earliestResult->fetch_assoc();
$earliestDate = $earliestDateRow['earliest_date'];
$stmtEarliest->close();

// Use the later of the two dates: startDate or earliestDate
$startDate = max($startDate, $earliestDate);

// Get the current month range
$currentDate = date('Y-m-d');
$currentMonthStart = date('Y-m-01');
$lastMonthStart = date('Y-m-01', strtotime('-1 month', strtotime($currentMonthStart)));
$lastMonthEnd = date('Y-m-t', strtotime('-1 month', strtotime($currentMonthStart)));

// Fetch the number of requests per month from the calculated start date to the current date
$query11 = "
    SELECT 
        DATE_FORMAT(requestingDate, '%Y-%m') AS month, 
        COUNT(DISTINCT clients.id) AS total_requests 
    FROM clients 
    JOIN echantillons ON clients.id = echantillons.client_id
    JOIN analyses ON echantillons.id = analyses.echantillon_id 
    WHERE analyses.departement = ?
    AND DATE(requestingDate) BETWEEN ? AND ?
    GROUP BY month
    ORDER BY month
";
$stmt11 = $conn->prepare($query11);
$stmt11->bind_param("sss", $department, $startDate, $currentDate);
$stmt11->execute();
$result11 = $stmt11->get_result();
$monthly_requests = [];
while ($row = $result11->fetch_assoc()) {
    $monthly_requests[$row['month']] = $row['total_requests'];
}
$stmt11->close();

// Generate a list of months from the start date to the current month, including those with zero requests
$months = [];
$start = new DateTime($startDate);
$end = new DateTime($currentDate);
$end->modify('+1 day'); // Move the end date to include the last day of the current month
$interval = DateInterval::createFromDateString('1 month');
$period = new DatePeriod($start, $interval, $end);

foreach ($period as $date) {
    $month = $date->format('Y-m');
    $months[$month] = isset($monthly_requests[$month]) ? $monthly_requests[$month] : 0;
}

// Prepare the data for output
$data['monthly_requests'] = array_map(function($month, $total_requests) {
    return ['month' => $month, 'total_requests' => $total_requests];
}, array_keys($months), $months);


// Fetch request status breakdown
$query12 = "
    SELECT 
        SUM(CASE WHEN status_counts.status = 'pending_payment' THEN 1 ELSE 0 END) AS pending_payment,
        SUM(CASE WHEN status_counts.status = 'pending_office_validation' THEN 1 ELSE 0 END) AS pending_office_validation,
        SUM(CASE WHEN status_counts.status = 'in_analysis' THEN 1 ELSE 0 END) AS in_analysis,
        SUM(CASE WHEN status_counts.status = 'awaiting_result_review' THEN 1 ELSE 0 END) AS awaiting_result_review,
        SUM(CASE WHEN status_counts.status = 'awaiting_result_validation' THEN 1 ELSE 0 END) AS awaiting_result_validation,
        SUM(CASE WHEN status_counts.status = 'completed' THEN 1 ELSE 0 END) AS completed
    FROM (
        SELECT 
            echantillons.client_id,
            CASE 
                WHEN MIN(analyses.validated) = 'reception_step_1' THEN 'pending_payment'
                WHEN MIN(analyses.validated) = 'finance' THEN 'pending_office_validation'
                WHEN MIN(analyses.validated) = 'office_step_1' THEN 'in_analysis'
                WHEN MIN(analyses.validated) = 'office_reject' THEN 'awaiting_result_review'
                WHEN MIN(analyses.validated) IN ('laboratory', 'office_step_2') THEN 'awaiting_result_validation'
                WHEN MIN(analyses.validated) = 'office_step_3' THEN 'completed'
            END AS status
        FROM clients
        JOIN echantillons ON clients.id = echantillons.client_id
        JOIN analyses ON echantillons.id = analyses.echantillon_id
        WHERE analyses.departement = ?
        AND DATE(requestingDate) >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
        GROUP BY echantillons.client_id
    ) AS status_counts
";
$stmt12 = $conn->prepare($query12);
$stmt12->bind_param("s", $department);
$stmt12->execute();
$result12 = $stmt12->get_result();
$data['request_status'] = $result12->fetch_assoc();
$stmt12->close();

// Output the final data as JSON
echo json_encode($data);

$conn->close();
?>