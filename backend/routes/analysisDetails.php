<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Include database connection
include '../config.php';

if (isset($_GET['id'])) {
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
} else {
    echo json_encode(['error' => 'No ID provided']);
}
?>
