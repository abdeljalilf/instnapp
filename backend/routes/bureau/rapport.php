<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

// Assurez-vous que les erreurs sont affichées
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include '../../database/db_connection.php';

// Vérifiez si 'demande_id' et 'department' sont définis et valides
if (isset($_GET['demande_id']) && is_numeric($_GET['demande_id']) && isset($_GET['department'])) {
    $demande_id = intval($_GET['demande_id']);
    $department = $_GET['department']; // Obtenez le département depuis la chaîne de requête

    // Utilisez une instruction préparée avec un espace réservé
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
            analyses.id AS analysis_id,
            analyses.analysisType,
            analyses.parameter,
            analyses.technique,
            analyses.Used_norme,
            elementsdinteret.id AS element_id,
            elementsdinteret.elementDinteret,
            resultats.Unite,
            resultats.Valeur_Moyenne,
            resultats.Limite_Detection
        FROM clients 
        JOIN echantillons ON clients.id = echantillons.client_id 
        JOIN analyses ON echantillons.id = analyses.echantillon_id 
        JOIN elementsdinteret ON analyses.id = elementsdinteret.analysis_id
        JOIN (
            SELECT resultats.*
            FROM resultats
            JOIN (
                SELECT elementsdinteret_id, MAX(id) AS max_id
                FROM resultats
                GROUP BY elementsdinteret_id
            ) latest_result ON resultats.elementsdinteret_id = latest_result.elementsdinteret_id
                AND resultats.id = latest_result.max_id
        ) resultats ON elementsdinteret.id = resultats.elementsdinteret_id
        WHERE clients.id = ? AND analyses.departement = ?
    ";

    // Préparez et exécutez la requête
    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("is", $demande_id, $department); // Liez les paramètres $demande_id et $department
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
                $sampleType = strtolower($row['sampleType']); // Assurez-vous de clés cohérentes pour le type d'échantillon
                $sampleReference = $row['sampleReference'];
                if (!isset($reports[$demande_id]['samples'][$sampleReference])) {
                    $reports[$demande_id]['samples'][$sampleReference] = [];
                }
                $reports[$demande_id]['samples'][$sampleReference][] = [
                    'sampleType' => $sampleType,
                    'sampleReference' => $sampleReference,
                    'samplingLocation' => $row['samplingLocation'],
                    'samplingDate' => $row['samplingDate'],
                    'sampledBy' => $row['sampledBy'],
                    'analysis_id' => $row['analysis_id'],
                    'analysisType' => $row['analysisType'],
                    'parameter' => $row['parameter'],
                    'technique' => $row['technique'],
                    'Used_norme' => $row['Used_norme'],
                    'element_id' => $row['element_id'],
                    'elementDinteret' => $row['elementDinteret'],
                    'Unite' => $row['Unite'],
                    'Valeur_Moyenne' => $row['Valeur_Moyenne'],
                    'Limite_Detection' => $row['Limite_Detection']
                ];
            }
            echo json_encode(array_values($reports), JSON_PRETTY_PRINT); // Affiche JSON avec mise en forme
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
