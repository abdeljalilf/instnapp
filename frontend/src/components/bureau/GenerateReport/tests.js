const handleSaveFinalFileReport = () => {
    // Vérifiez si le téléchargement de fichiers est requis
    if (atLeastOneSampleIsAir && files.length === 0) {
        errorMessage = 'Veuillez uploader au moins un fichier avant de valider.';
    }
    // Si un message d'erreur a été trouvé, affichez-le et arrêtez la validation
    if (errorMessage) {
        setValidationError(errorMessage);
        return;
    }

    // Create FormData object for file upload
    const formData = new FormData();
    formData.append('client_id', id);  // Assurez-vous que `id` correspond au client_id correct
    // Ajouter des fichiers à FormData
    files.forEach((file, index) => {
        formData.append(`file${index}`, file);
    });
    // Envoyer les données à l'API
    console.log('Sending report data:', reportData);

    fetch(`${apiBaseUrl}/instnapp/backend/routes/bureau/save_final_file_report.php?department=${department}`, {
        method: 'POST',
        headers: {
            'Authorization': session_id
        },
        body: formData,
    })
    .then((response) => response.text())  // Change to .text() to handle HTML response
    .then((text) => {
        console.log('Response from server:', text);

        try {
            const data = JSON.parse(text);
            if (data.success) {
            // le Rapport a été bien enregistrer
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
