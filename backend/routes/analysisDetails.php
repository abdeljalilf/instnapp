<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Include database connection
include '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = $_GET['id'];

    // Query to fetch details from analyses
    $query = $conn->prepare("SELECT * FROM analyses WHERE id = ?");
    $query->bind_param("i", $id);
    $query->execute();
    $result = $query->get_result();
    $analysis = $result->fetch_assoc();

    if ($analysis) {
        // Query to fetch elements d'interet
        $query = $conn->prepare("SELECT elementDinteret FROM elementsdinteret WHERE analysis_id = ?");
        $query->bind_param("i", $id);
        $query->execute();
        $result = $query->get_result();
        $elements = [];
        while ($row = $result->fetch_assoc()) {
            $elements[] = $row['elementDinteret']; // Ensure this matches your column name in elementsdinteret table
        }

        // Query to fetch sample details
        $query = $conn->prepare("SELECT * FROM echantillons WHERE id = ?");
        $query->bind_param("i", $analysis['echantillon_id']);
        $query->execute();
        $result = $query->get_result();
        $sample = $result->fetch_assoc();

        if ($sample) {
            // Combine all data into a single array
            $details = array_merge($analysis, [
                'elementDinteret' => $elements,
                'sampleType' => $sample['sampleType'], // Ensure these match your column names in echantillons table
                'samplingLocation' => $sample['samplingLocation'],
                'samplingDate' => $sample['samplingDate'],
                'sampleReference' => $sample['sampleReference'] // Add this field
            ]);
        } else {
            // Sample details not found
            $details = array_merge($analysis, [
                'elementDinteret' => $elements,
                'sampleType' => null,
                'samplingLocation' => null,
                'samplingDate' => null,
                'sampleReference' => null // Add this field
            ]);
        }

        echo json_encode($details);
    } else {
        echo json_encode(['error' => 'Analysis not found']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the data from the request
    $data = json_decode(file_get_contents('php://input'), true);

    if ($data) {
        $analysisId = $data['analysisId'];
        $results = $data['results'];

        // Prepare the SQL statement for inserting/updating results
        $stmt = $conn->prepare("
            INSERT INTO results (analysis_id, element, concentration_moyenne, incertitude, unite)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            concentration_moyenne = VALUES(concentration_moyenne),
            incertitude = VALUES(incertitude),
            unite = VALUES(unite)
        ");

        foreach ($results as $result) {
            $element = $result['element'];
            $concentrationMoyenne = $result['concentrationMoyenne'];
            $incertitude = $result['incertitude'];
            $unite = $result['unite'];

            // Bind the parameters
            $stmt->bind_param("issss", $analysisId, $element, $concentrationMoyenne, $incertitude, $unite);
            $stmt->execute();
        }

        // Update the validated column in analyses table
        $updateQuery = $conn->prepare("UPDATE analyses SET validated = 'laboratory' WHERE id = ?");
        $updateQuery->bind_param("i", $analysisId);
        $updateQuery->execute();

        // Return success message
        echo json_encode(['message' => 'Results saved successfully']);
    } else {
        // Return error message
        echo json_encode(['error' => 'Invalid input']);
    }
} else {
    echo json_encode(['error' => 'Invalid request method']);
}

$conn->close();
?>
