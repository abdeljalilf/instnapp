<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include '../../database/db_connection.php';

// Handle preflight requests (OPTIONS method)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Get the JSON input from the request
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Check if necessary fields are set
if (isset($data['demande_id']) && isset($data['department']) && isset($data['conclusion'])) {
    $client_id = intval($data['demande_id']);
    $department = $data['department'];
    $conclusion = $data['conclusion'];
    $observations = $data['observations'];
    $normes = $data['normes'];

    // Begin a transaction
    $conn->begin_transaction();

    try {
        // Check if a conclusion already exists for this client_id
        $sql = "SELECT id FROM conclusions WHERE client_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $client_id);
        $stmt->execute();
        $stmt->bind_result($conclusion_id);
        $stmt->fetch();
        $stmt->close();

        if ($conclusion_id) {
            // Update the existing conclusion
            $sql = "
                UPDATE conclusions
                SET departement = ?, conclusion = ?
                WHERE client_id = ?
            ";

            if ($stmt = $conn->prepare($sql)) {
                $stmt->bind_param("ssi", $department, $conclusion, $client_id);
                $stmt->execute();
                $stmt->close();
            } else {
                throw new Exception('Failed to prepare statement for updating conclusion');
            }
        } else {
            // Insert a new conclusion
            $sql = "
                INSERT INTO conclusions (client_id, departement, conclusion)
                VALUES (?, ?, ?)
            ";

            if ($stmt = $conn->prepare($sql)) {
                $stmt->bind_param("iss", $client_id, $department, $conclusion);
                $stmt->execute();
                $stmt->close();
            } else {
                throw new Exception('Failed to prepare statement for inserting conclusion');
            }
        }

        // Debug: Print observations and normes
        error_log("Observations: " . print_r($observations, true));
        error_log("Normes: " . print_r($normes, true));

        // Update observations and normes
        foreach ($observations as $key => $value) {
            list($sampleReference, $analysisKey, $elementDinteret) = explode('-', $key);

            // Debug: Print extracted keys
            error_log("Sample Reference: $sampleReference, Analysis Key: $analysisKey, Element D'interet: $elementDinteret");

            // Find the relevant IDs from the database
            $sql = "
                SELECT r.id AS result_id, a.id AS analysis_id, e.id AS element_id
                FROM resultats r
                INNER JOIN elementsdinteret e ON e.id = r.elementsdinteret_id
                INNER JOIN analyses a ON a.id = e.analysis_id
                INNER JOIN echantillons s ON s.id = a.echantillon_id
                WHERE s.sampleReference = ? AND a.analysisType = ? AND e.elementDinteret = ?
                LIMIT 1
            ";

            if ($stmt = $conn->prepare($sql)) {
                $stmt->bind_param("sss", $sampleReference, $analysisKey, $elementDinteret);
                $stmt->execute();
                $stmt->bind_result($result_id, $analysis_id, $element_id);
                $stmt->fetch();
                $stmt->close();

                // Debug: Log fetched IDs
                error_log("Fetched IDs - Result ID: $result_id, Analysis ID: $analysis_id, Element ID: $element_id");

                if ($result_id && $analysis_id) {
                    // Update observations
                    $sql = "
                        UPDATE resultats
                        SET Observation = ?
                        WHERE id = ?
                    ";

                    if ($updateStmt = $conn->prepare($sql)) {
                        $updateStmt->bind_param("si", $value, $result_id);
                        $updateStmt->execute();
                        $updateStmt->close();
                    } else {
                        throw new Exception('Failed to prepare statement for updating observations');
                    }

                    // Update normes values in resultats table
                    foreach ($normes as $normeKey => $normeValue) {
                        list($normeSampleRef, $normeAnalysisKey, $elementNormeDinteret) = explode('-', $normeKey);

                        if ($normeSampleRef === $sampleReference && $normeAnalysisKey === $analysisKey && $elementNormeDinteret == $elementDinteret) {
                            $sql = "
                                UPDATE resultats r
                                INNER JOIN elementsdinteret e ON e.id = r.elementsdinteret_id
                                SET r.Valeur_Norme_Utlise = ?
                                WHERE e.elementDinteret = ? AND e.id = ?
                            ";

                            if ($normeStmt = $conn->prepare($sql)) {
                                $normeStmt->bind_param("ssi", $normeValue, $elementNormeDinteret, $element_id);
                                $normeStmt->execute();
                                $normeStmt->close();
                            } else {
                                throw new Exception('Failed to prepare statement for updating norme values');
                            }
                        }
                    }

                    // Update Used_norme in analyses table
                    $normeUtilisee = $normes["{$sampleReference}-{$analysisKey}-normeUtilisee"] ?? '';
                    $sql = "
                        UPDATE analyses
                        SET Used_norme = ?
                        WHERE id = ?
                    ";

                    if ($usedNormeStmt = $conn->prepare($sql)) {
                        $usedNormeStmt->bind_param("si", $normeUtilisee, $analysis_id);
                        $usedNormeStmt->execute();
                        $usedNormeStmt->close();
                    } else {
                        throw new Exception('Failed to prepare statement for updating Used_norme');
                    }
                } else {
                    throw new Exception('No matching records found for updating');
                }
            } else {
                throw new Exception('Failed to prepare statement for fetching result and analysis IDs');
            }
        }

        // Commit the transaction
        $conn->commit();

        echo json_encode(['success' => true]);

    } catch (Exception $e) {
        // Rollback the transaction if there was an error
        $conn->rollback();
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'Invalid input data']);
}

$conn->close();
?>
