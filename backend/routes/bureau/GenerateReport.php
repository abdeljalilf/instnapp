<?php
//GenerateReport.php
require_once '../../routes/login/session_util.php';
require_once '../../database/db_connection.php';

header('Access-Control-Allow-Origin: *');
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

// Vérifiez si 'demande_id' et 'department' sont définis et valides
if (isset($_GET['demande_id']) && is_numeric($_GET['demande_id']) && isset($_GET['department'])) {
    $demande_id = intval($_GET['demande_id']);
    $department = $_GET['department']; // Obtenez le département depuis la chaîne de requête

    // Requête pour récupérer les données du rapport
    $sql = "
    SELECT 
        clients.id AS demande_id, 
        clients.dilevery_delay, 
        clients.name AS client_name, 
        clients.address AS client_address,
        clients.phone AS client_phone, 
        clients.requestingDate,
        clients.clientReference,
        clients.cle_client,
        clients.broughtBy,
        echantillons.sampleType, 
        echantillons.sampleReference,
        echantillons.samplingLocation,
        echantillons.samplingDate,
        echantillons.sampledBy,
        echantillons.quantiteDenree,
        echantillons.samplingTime,
        echantillons.clientSampleRefrence,
        analyses.id AS analysis_id,
        analyses.analysisType,
        analyses.parameter,
        analyses.technique,
        analyses.Used_norme,
        elementsdinteret.id AS element_id,
        elementsdinteret.elementDinteret,
        resultats.Unite,
        resultats.Valeur_Moyenne,
        resultats.Limite_Detection,
        resultats.Incertitude,
        resultats.Valeur_Norme_Utlise, 
        resultats.Observation,
        last_conclusion.conclusion
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
    LEFT JOIN (
        SELECT *
        FROM conclusions
        WHERE (client_id, departement, id) IN (
            SELECT client_id, departement, MAX(id)
            FROM conclusions
            GROUP BY client_id, departement
        )
    ) last_conclusion ON clients.id = last_conclusion.client_id AND analyses.departement = last_conclusion.departement
    WHERE clients.id = ? AND analyses.departement = ? AND 
    analyses.validated IN ('office_step_3', 'reception_step_2') AND echantillons.sampleType !='air'
";


    // Préparez et exécutez la requête pour les données du rapport
    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("is", $demande_id, $department);
        $stmt->execute();
        $result = $stmt->get_result();

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
                    'cle_client' => $row['cle_client'],
                    'client_phone' => $row['client_phone'], 
                    'broughtBy' => $row['broughtBy'], 
                    'conclusion' => $row['conclusion'] ?? '' ,
                    'samples' => []
                    
                ];
            }
            $sampleType = strtolower($row['sampleType']);
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
                'samplingTime' => $row['samplingTime'],
                'quantiteDenree' => $row['quantiteDenree'],
                'clientSampleRefrence' => $row['clientSampleRefrence'],
                'analysis_id' => $row['analysis_id'],
                'analysisType' => $row['analysisType'],
                'parameter' => $row['parameter'],
                'technique' => $row['technique'],
                'Used_norme' => $row['Used_norme'],
                'element_id' => $row['element_id'],
                'elementDinteret' => $row['elementDinteret'],
                'Unite' => $row['Unite'],
                'Valeur_Moyenne' => $row['Valeur_Moyenne'],
                'Valeur_Norme_Utlise' => $row['Valeur_Norme_Utlise'],
                'Limite_Detection' => $row['Limite_Detection'],
                'Observation' => $row['Observation'],
                'Incertitude' => $row['Incertitude']
            ];
        }
        $stmt->close();
    } else {
        echo json_encode(['error' => 'Failed to prepare SQL statement']);
        exit;
    }
    // Requête pour récupérer les types de tous les échantillons de la demande récupérée
    $sampleTypesSql = "
        SELECT DISTINCT sampleType
        FROM echantillons
        WHERE client_id = ?
    ";

    $sampleTypes = [];
    if ($stmt = $conn->prepare($sampleTypesSql)) {
        $stmt->bind_param("i", $demande_id);
        $stmt->execute();
        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc()) {
            $sampleTypes[] = strtolower($row['sampleType']);
        }
        $stmt->close();
    } else {
        echo json_encode(['error' => 'Failed to prepare sample types SQL statement']);
        exit;
    }

    // Requête pour compter les analyses N1 et N2 pour ce client et ce département
    $countSql = "
        SELECT 
            SUM(CASE WHEN validated = 'laboratory' THEN 1 ELSE 0 END) AS N1,
            COUNT(*) AS N2
        FROM analyses
        JOIN echantillons ON analyses.echantillon_id = echantillons.id
        WHERE echantillons.client_id = ? AND analyses.departement = ? AND validated IN ('office_reject', 'office_step_1', 'laboratory')
    ";

    if ($stmt = $conn->prepare($countSql)) {
        $stmt->bind_param("is", $demande_id, $department);
        $stmt->execute();
        $countResult = $stmt->get_result();
        $counts = $countResult->fetch_assoc();
        $stmt->close();
    } else {
        echo json_encode(['error' => 'Failed to prepare count SQL statement']);
        exit;
    }

    $N1 = $counts['N1'];
    $N2 = $counts['N2'];
    

    // Inclure les résultats dans la réponse JSON
    $response = [
        'reports' => array_values($reports),
        'sampleTypes' => $sampleTypes,
        'N1' => $N1,
        'N2' => $N2
    ];

    echo json_encode($response, JSON_PRETTY_PRINT);
    $conn->close();
} else {
    echo json_encode(['error' => 'Invalid demande_id or department']);
}
?>
