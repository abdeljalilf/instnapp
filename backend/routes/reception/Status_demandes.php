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

// Vérifiez la session
$user = checkSession($conn);
authorize(['reception'], $user);

// Récupérer toutes les demandes d'analyses
$query = $conn->prepare("
    SELECT c.id as clientId, c.clientReference, c.name, c.phone, c.email, c.dilevery_delay, a.departement, a.validated, a.analysisType
    FROM clients c
    LEFT JOIN echantillons e ON c.id = e.client_id
    LEFT JOIN analyses a ON e.id = a.echantillon_id
    WHERE c.id IS NOT NULL
    ORDER BY c.id DESC
");
$query->execute();
$results = $query->get_result();

$demandes = [];

while ($row = $results->fetch_assoc()) {
    $clientId = $row['clientId'];
    $departement = $row['departement'];
    
    if (!isset($demandes[$clientId])) {
        $demandes[$clientId] = [
            'clientId' => $clientId,
            'clientReference' => $row['clientReference'],
            'name' => $row['name'],
            'phone' => $row['phone'],
            'email' => $row['email'],
            'dilevery_delay' => $row['dilevery_delay'],
            'departments' => []
        ];
    }

    if (!isset($demandes[$clientId]['departments'][$departement])) {
        $demandes[$clientId]['departments'][$departement] = [
            'analyses' => [],
            'validated_status' => 'En attente de validation du paiment', // Par défaut au premier statut
        ];
    }

    // Ajouter l'analyse dans le département
    $demandes[$clientId]['departments'][$departement]['analyses'][] = [
        'analysisType' => $row['analysisType'],
        'validated' => $row['validated']
    ];

    // Mettre à jour le statut global du département
    if ($row['validated'] === 'finance') {
        $demandes[$clientId]['departments'][$departement]['validated_status'] = 'paiment validé';
    } elseif (in_array($row['validated'], ['office_step_1', 'office_reject'])) {
        $demandes[$clientId]['departments'][$departement]['validated_status'] = "En cours d'analyse";
    } elseif ($row['validated'] === 'laboratory') {
        $demandes[$clientId]['departments'][$departement]['validated_status'] = 'En cours de génération du rapport';
    } elseif ($row['validated'] === 'office_step_2') {
        $demandes[$clientId]['departments'][$departement]['validated_status'] = 'En cours de génération du rapport';
    } elseif ($row['validated'] === 'office_step_3') {
        $demandes[$clientId]['departments'][$departement]['validated_status'] = 'Rapport généré';
    } elseif ($row['validated'] === 'reception_step_2') {
        $demandes[$clientId]['departments'][$departement]['validated_status'] = 'Rapport livré';
    }
}

// Après avoir traité toutes les analyses, vérifier les statuts pour tous les départements
foreach ($demandes as $clientId => &$clientData) {
    foreach ($clientData['departments'] as $departement => &$deptData) {
        $allAnalysesValidated = true;
        $anyRejected = false;

        foreach ($deptData['analyses'] as $analysis) {
            if ($analysis['validated'] !== 'office_step_3') {
                $allAnalysesValidated = false;
            }
            if ($analysis['validated'] !== 'reception_step_2') {
                $allAnalysesValidated = false;
            }
            if ($analysis['validated'] === 'office_reject') {
                $anyRejected = true;
            }
        }

        // Déterminer le statut final du département
        if ($anyRejected) {
            $deptData['final_status'] = "Resultats rejté, En cours d'analyse";
        } elseif ($allAnalysesValidated) {
            $deptData['final_status'] = 'Demande terminée dans le département';
        } else {
            $deptData['final_status'] = 'En cours d\'analyse dans le département';
        }
    }
}

echo json_encode(['success' => true, 'demandes' => array_values($demandes)]);
?>
