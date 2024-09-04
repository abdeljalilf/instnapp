const handlesaveentries = () => {
    let successMessage = 'Les données ont été bien enregistré';
    let errorMessage = '';
    const usedNormes = Object.entries(normesState).map(([key, value]) => {
        const [sampleReference, analysisKey, element_id] = key.split('-');
        return {
            analysis_id: analysisKey,
            Used_norme: value,
        };
    });

    const normeValues = Object.entries(normeValuesState).map(([key, value]) => {
        const [sampleReference, analysisKey, element_id] = key.split('-');
        return {
            element_id: element_id,
            Valeur_Norme_Utlise: value,
        };
    });

    const allAnalysisIds = Object.keys(groupedSamples).reduce((acc, sampleReference) => {
        const analyses = groupedSamples[sampleReference].analyses;
        const analysisIds = Object.keys(analyses).map(key => analyses[key].analysis_id);
        return [...acc, ...analysisIds];
    }, []);

    const reportData = {
        usedNormes: usedNormes,
        normeValues: normeValues,
        observations: Object.entries(observationsState).map(([key, value]) => {
            const [sampleReference, analysisKey, resultIndex] = key.split('-');
            return {
                element_id: resultIndex,
                Observation: isFieldVisible(sampleReference, analysisKey, 'observations') ? value : '',
            };
        }),
        conclusion: conclusion,
        client_id: id,
        departement: department,
        allAnalysisIds: allAnalysisIds,
    };
    // Envoyer les données à l'API
    console.log('Sending report data:', reportData);

    fetch(`${apiBaseUrl}/instnapp/backend/routes/bureau/save_entries.php?department=${department}`, {
        method: 'POST',
        headers: {
            'Authorization': session_id
        },
        body: reportData,
    })
    .then((response) => response.text())  // Change to .text() to handle HTML response
    .then((text) => {
        console.log('Response from server:', text);

        try {
            const data = JSON.parse(text);
            if (data.success) {
                sessionStorage.setItem('conclusion', conclusion);
                setSuccessMessage(successMessage); // Set success message
                setValidationError('');
            } else {
                setValidationError(data.message || 'Erreur lors de l\'enregistrement des données.');
            }
        } catch (error) {
            console.error('Error parsing JSON:', error);
            setValidationError('Erreur lors de l\'enregistrement des données.');
        }
    })
    .catch((error) => {
        setValidationError('Erreur lors de l\'enregistrement des données.');
    });
};