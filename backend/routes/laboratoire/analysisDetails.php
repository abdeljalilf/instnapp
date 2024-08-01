<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Include database connection
include '../../database/db_connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = $_GET['id'];

    // Query to fetch details from analyses
    $query = $conn->prepare("SELECT * FROM analyses WHERE id = ?");
    $query->bind_param("i", $id);
    $query->execute();
    $result = $query->get_result();
    $analysis = $result->fetch_assoc();

    if ($analysis) {
        // Query to fetch elements d'interet with their IDs
        $query = $conn->prepare("SELECT id, elementDinteret FROM elementsdinteret WHERE analysis_id = ?");
        $query->bind_param("i", $id);
        $query->execute();
        $result = $query->get_result();
        $elements = [];
        while ($row = $result->fetch_assoc()) {
            $elements[] = [
                'id' => $row['id'],
                'elementDinteret' => $row['elementDinteret'] // Ensure this matches your column name in elementsdinteret table
            ];
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
                'elementsdinteret' => $elements,
                'sampleType' => $sample['sampleType'], // Ensure these match your column names in echantillons table
                'samplingLocation' => $sample['samplingLocation'],
                'samplingDate' => $sample['samplingDate'],
                'sampleReference' => $sample['sampleReference'] // Add this field
            ]);
        } else {
            // Sample details not found
            $details = array_merge($analysis, [
                'elementsdinteret' => $elements,
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
            INSERT INTO resultats (elementsdinteret_id, Unite, Valeur_Moyenne, Limite_Detection, Incertitude)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            Unite = VALUES(Unite),
            Valeur_Moyenne = VALUES(Valeur_Moyenne),
            Limite_Detection = VALUES(Limite_Detection),
            Incertitude = VALUES(Incertitude);
        ");

        foreach ($results as $result) {
            $elementsdinteretId = $result['elementsdinteretId'];  // Ensure this is provided in the payload
            $unite = $result['unite'];
            $valeurMoyenne = ($result['valeurMoyenne'] === 'non détecté' || in_array($result['valeurMoyenne'], ['Majeur', 'Mineur', 'Trace'])) ? $result['valeurMoyenne'] : $result['valeurMoyenne'];
            $limiteDetection = $result['limiteDetection'];
            $incertitude = $result['incertitude'] === 'non détecté' ? 'non détecté' : $result['incertitude'];

            // Bind the parameters
            $stmt->bind_param("issss", $elementsdinteretId, $unite, $valeurMoyenne, $limiteDetection, $incertitude);
            $stmt->execute();
        }

        // Update the validated column in analyses table using the analysisId
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