import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './GenerateRapport.css';
import html2pdf from 'html2pdf.js';
import jsPDF from 'jspdf';
import { FaTimes } from 'react-icons/fa';

const GenirateRapport = () => {
    const { id, department } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const session_id = localStorage.getItem('session_id');
    const [files, setFiles] = useState([]);
    const [fileText, setFileText] = useState('Aucun fichier n\'a été sélectionné');
    const fileInputRef = useRef(null);
    const [inputKey, setInputKey] = useState(Date.now()); 
    const [validationError, setValidationError] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); // Add state for success message



    useEffect(() => {
        if (id && department) {
            fetch(`${apiBaseUrl}/instnapp/backend/routes/bureau/GenerateReport.php?demande_id=${id}&department=${department}`, {
                headers: {
                    Authorization: session_id
                }
            })
                .then((response) => response.text())
                .then((text) => {
                    try {
                        const data = JSON.parse(text);
                        if (data.error) {
                            setError(data.error);
                        } else {
                            setData(data.reports[0]);
                            console.log('Data received from API:', data);
                            console.log('Data received from API:', data.sampleTypes);

                        }
                    } catch (error) {
                        setError('Failed to parse JSON');
                    }
                })
                .catch((error) => {
                    setError(error.message);
                });
        } else {
            setError('Invalid demande_id provided');
        }
    }, [id, department]);
    // Define the atLeastOneSampleIsAir constant
    const sampleTypes = data?.sampleTypes || []; // Safely access sampleTypes

    // Check if 'air' is in sampleTypes
    const containsAirSample = sampleTypes.includes('air');

    const handleSaveFinalFileReport = () => {
        let errorMessage = '';
        let successMessage = 'Le Rapport a été bien enregistré';
        
        if (containsAirSample && files.length === 0) {
            errorMessage = 'Veuillez uploader au moins un fichier avant de valider.';
        }
        
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
        console.log('Sending report data:', formData);
    
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
                    setSuccessMessage(successMessage); // Set success message
                    setValidationError(''); // Clear any existing validation error
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
    const handleDownload = () => {
        const element = document.getElementById('report-container');
        const sanitizedClientReference = data.clientReference.replace(/\//g, '_');
        const opt = {
            margin: [35, 15,35, 10], // 35mm for top and bottom, 10mm for sides
            filename: `rapport_final_${sanitizedClientReference}_${department}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: 'css' }
        };
        html2pdf().from(element).set(opt).toPdf().get('pdf').then((pdf) => {
            const totalPages = pdf.internal.getNumberOfPages();
            pdf.setPage(1);
    
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.text(`Page ${i}/${totalPages}`, 200, 268, { align: 'right' });
            }
    
            pdf.save(`rapport_final_${sanitizedClientReference}_${department}.pdf`);
        });
    };
    
    

    if (error) {
        return <div className="error-message">Erreur : {error}</div>;
    }

    if (!data) {
        return <div className="loading-message">Chargement...</div>;
    }

    const groupedSamples = Object.entries(data.samples).reduce((acc, [sampleType, samples]) => {
        samples.forEach((sample) => {
            if (!acc[sample.sampleReference]) {
                acc[sample.sampleReference] = {
                    sampleType:sample.sampleType,
                    sampleDetails: sample,
                    analyses: {}
                };
            }
            const analysisKey = `${sample.analysis_id}`;
            if (!acc[sample.sampleReference].analyses[analysisKey]) {
                acc[sample.sampleReference].analyses[analysisKey] = {
                    analysisType: sample.analysisType,
                    parameter: sample.parameter,
                    technique: sample.technique,
                    elementsdinteret: [],
                    norme: sample.Used_norme || 'Norme Utilisée',
                    analysis_id: sample.analysis_id
                };
            }
            acc[sample.sampleReference].analyses[analysisKey].elementsdinteret.push({
                elementDinteret: sample.elementDinteret,
                Unite: sample.Unite,
                Valeur_Moyenne: sample.Valeur_Moyenne,
                Limite_Detection: sample.Limite_Detection,
                Incertitude: sample.Incertitude,
                Observation: sample.Observation,
                element_id: sample.element_id,
                Valeur_Norme_Utlise: sample.Valeur_Norme_Utlise
            });
        });
        return acc;
    }, {});
    const capitalizeFirstLetter = (string) => {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    const groupedSamplesArray = Object.entries(groupedSamples);
    const uniqueSampleCount = groupedSamplesArray.length;
    const sampleList = groupedSamplesArray.map(([sampleReference, {sampleType}], index) => (
        <div key={index} >
            <p> &nbsp;&nbsp;<b> Code {sampleReference}&nbsp;:</b> &nbsp;{capitalizeFirstLetter(sampleType)} </p>
        </div>
    ));
    // Déterminer le texte du <th> en fonction du département
    const getHeaderText = () => {
        switch (department) {
            case 'TFXE':
            case 'HI':
                return 'Valeur Moyenne Mesurée';
            case 'ATN':
                return 'Activité';
            default:
                return 'Valeur Moyenne'; // Valeur par défaut si aucun des cas ne correspond
        }
    };
    const handleFileUpload = (e) => {
        const uploadedFiles = Array.from(e.target.files);
        if (uploadedFiles.length > 0) {
            setFiles(prevFiles => [...prevFiles, ...uploadedFiles]);
            setFileText(''); // Réinitialiser le texte quand des fichiers sont ajoutés
        }
        if (uploadedFiles.length === 0) {
            e.target.value = null; // Effacer la valeur de l'input pour permettre la ré-sélection des mêmes fichiers
        }
        
    };

    const handleRemoveFile = (fileToRemove) => {
        setFiles(prevFiles => {
            const newFiles = prevFiles.filter(file => file !== fileToRemove);
            if (newFiles.length === 0) {
                setFileText('Aucun fichier n\'a été sélectionné'); // Réinitialiser le texte quand la liste devient vide
            }
            return newFiles;
        });

        // Réinitialiser l'élément d'entrée de fichiers
        setInputKey(Date.now());
    };
    return (
        <div className="report-wrapper">
            <div className="report-container-non-imprime">
            <div className="report-container" id="report-container">
                <header className="report-header">
                    <div className="date-location-ref-demande">
                    <p className="ref-demande">
                        <strong>Référence :</strong> {data.clientReference.replace(/^DS/, "RA")}/INSTN/DG/{department}
                    </p>
                    <p className="date-location">
                        <strong>Antananarivo, le</strong>{' '}
                        {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    </div>
                    <div className="results-header-container">
                        <h1>RÉSULTATS D'ANALYSES</h1>
                    </div>
                </header>

                <section className="client-info">
                    <h2>1. Informations du Client</h2>
                    <table className="client-info-table">
                        <tbody>
                            <tr>
                                <td><strong>Nom</strong></td>
                                <td><b>: {data.client_name}</b></td>
                            </tr>
                            <tr>
                                <td><strong>Adresse</strong></td>
                                <td><b>: </b>{data.client_address}</td>
                            </tr>
                            <tr>
                                <td><strong>Téléphone</strong></td>
                                <td><b>: </b>{data.client_phone}</td>
                            </tr>
                            {data.cle_client && (
                                <tr>
                                    <td><strong>Référence du client</strong></td>
                                    <td><b>: </b>{data.cle_client}</td>
                                </tr>
                            )}
                            <tr>
                                <td><strong>Nombre d’échantillons</strong></td>
                                <td><b>: </b>{uniqueSampleCount} échantillon{uniqueSampleCount > 1 ? 's' : ''}</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>{sampleList}</td>
                            </tr>
                            <tr>
                                <td><strong>Apporté par</strong></td>
                                <td><b>: </b>{data.broughtBy}</td>
                            </tr>
                            <tr>
                                <td><strong>Date d'arrivée</strong></td>
                                <td><b>: </b>{new Date(data.requestingDate).toLocaleDateString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </section>
                <section className="reportconclusion-section">
                    <h2>2. Conclusion</h2>
                    <p>
                    <div className="conclusion-display"
                        dangerouslySetInnerHTML={{ __html: data.conclusion }}
                    />
                    </p>
                </section>

                <section className="reportresults-section">
                    <h2>3. Résultats</h2>
                    <p>Les résultats d’analyses sont reportés dans les tableaux ci-dessous.</p>
                </section>

                {groupedSamplesArray.map(([sampleReference, { sampleType, sampleDetails, analyses }], index) => (
                    <div className="reportsample-section" key={index}>
                        <h3>Échantillon {index + 1} : {sampleType} - Code {sampleReference}</h3>
                        <table className="sample-info-table">
                            <tbody>
                                <tr>
                                    <td><strong>Lieu de Prélèvement</strong></td>
                                    <td><b>: </b>{sampleDetails.samplingLocation}</td>
                                </tr>
                                <tr>
                                    <td><strong>Référence Echantillon du Client</strong></td>
                                    <td><b>: </b>{sampleDetails.clientSampleRefrence || '-'}</td>
                                </tr>
                                <tr>
                                    <td><strong>Date de Prélèvement</strong></td>
                                    <td>
                                    <b>: </b>{new Date(sampleDetails.samplingDate).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                        {sampleDetails.samplingTime && (
                                            <> {sampleDetails.samplingTime}</>
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Prélèvement effectué par</strong></td>
                                    <td><b>: </b>{sampleDetails.sampledBy}</td>
                                </tr>
                                {sampleDetails.quantiteDenree && (
                                    <tr>
                                        <td><strong>Poids total de la Marchandise</strong></td>
                                        <td><b>: </b>{sampleDetails.quantiteDenree}</td>
                                    </tr>
                                )}
                                {sampleDetails.midacNumber && department === 'ATN' && (
                                    <tr>
                                        <td><strong>Numéro PV et MIDAC</strong></td>
                                        <td><b>: </b>{sampleDetails.midacNumber}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                       
                        {Object.entries(analyses).map(([analysisKey, { analysisType, parameter, technique, elementsdinteret, norme,analysis_time }], analysisIndex) => (
                            <div key={analysisKey} className="reportanalysis-section">
                                <h4>Analyse {analysisIndex + 1}: {analysisType} pour {sampleType.toUpperCase()}</h4>
                                {department === 'ATN' && (
                                <p><strong>Durée de mesure :</strong> {analysis_time}</p>
                                )}
                                <table className="reportanalysis-table">
                                    <thead>
                                        <tr>
                                            <th>{parameter}</th>
                                            <th>Unité</th>
                                            <th>{getHeaderText()}</th>
                                            <th>Limite de Détection</th>
                                            <th>Technique Utilisée</th>
                                            {analysisType === 'Quantitative' && (
                                            <th>{norme}</th>
                                            )}
                                            {analysisType === 'Quantitative' && (
                                            <th>Observation</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {elementsdinteret.map((element, resultIndex) => (
                                            <tr key={resultIndex}>
                                                <td>{element.elementDinteret}</td>
                                                <td>{element.Unite}</td>
                                                <td>{element.Valeur_Moyenne}</td>
                                                <td>{element.Limite_Detection}</td>
                                                <td>{technique}</td>
                                                {analysisType === 'Quantitative' && (
                                                <td>{element.Valeur_Norme_Utlise}</td>
                                                )}
                                                {analysisType === 'Quantitative' && (
                                                <td>{element.Observation}</td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                ))}

            </div>
            </div>
            <div className="report-bottom">
            <div className="finalreport-upload-form">
                    <h2>Version Final du Rapport Généré Manuellement </h2>
                    <p className='text_file-obligation'> <strong>Si Elle Existe</strong></p>
                    <input
                        key={inputKey} // Utilisez la clé pour forcer le composant à se réinitialiser
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                    />
                    <div className="file-status">
                        <p className={fileText ? 'file-text-error' : ''}>{fileText || files.map((file, index) => (
                            <div key={index} className="file-item">
                                <span className="file-name">{file.name}</span>
                                <button
                                    className="remove-file-button"
                                    onClick={() => handleRemoveFile(file)}
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        ))}</p>
                    </div>
                    <div className="button-group">
                        <button className="upload-finalreport-button" onClick={handleSaveFinalFileReport}>Sauvegarder le Rapport</button>
                     </div>
                     {validationError && <div className="validation-error">{validationError}</div>}
                     {successMessage && <div className="success-Message">{successMessage}</div>}
                </div>
                    <button className="report-download-button" onClick={handleDownload}>
                        Télécharger le Rapport
                    </button>
            </div>
        </div>
    );
};

export default GenirateRapport;
