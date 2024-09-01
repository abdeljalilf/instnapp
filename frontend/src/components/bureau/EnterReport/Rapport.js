import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import './Rapport.css';

const Rapport = () => {
    const { id, department } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [conclusion, setConclusion] = useState('');
    const [ReferenceClientATN, setReferenceClientATN] = useState('');
    const [observationsState, setObservationsState] = useState({});
    const [normesState, setNormesState] = useState({});
    const [normeValuesState, setNormeValuesState] = useState({});
    const [validationError, setValidationError] = useState('');
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const [showRemarkForm, setShowRemarkForm] = useState({});
    const [remarksState, setRemarksState] = useState({});
    const [N1, setN1] = useState(0);
    const [N2, setN2] = useState(0);
    const session_id = localStorage.getItem('session_id');
    const [showStandardResults, setShowStandardResults] = useState(false);
    const [files, setFiles] = useState([]);
    const [fileText, setFileText] = useState('Aucun fichier n\'a été sélectionné');
    const fileInputRef = useRef(null);
    const [inputKey, setInputKey] = useState(Date.now()); // Clé pour réinitialiser l'élément d'entrée

    

    useEffect(() => {
      if (id && department) {
          fetch(`${apiBaseUrl}/instnapp/backend/routes/bureau/rapport.php?demande_id=${id}&department=${department}`, {
              headers: {
                  Authorization: session_id
              }
          })
          .then((response) => {
              if (!response.ok) {
                  throw new Error('Failed to fetch data');
              }
              return response.json();
          })
          .then((data) => {
              console.log('Data received from API:', data);
              if (data.error) {
                  setError(data.error);
              } else if (data.reports && Array.isArray(data.reports) && data.reports.length > 0) {
                  setData(data.reports[0]);
                  setN1(Number(data.N1) || 0);
                  setN2(Number(data.N2) || 0);
                  
                  // Initialize observationsState
                  setObservationsState(
                      Object.fromEntries(
                          Object.entries(data.reports[0].samples).flatMap(([sampleReference, sampleArray]) =>
                              sampleArray.flatMap(({ analysis_id, element_id, Observation }) => [
                                  [`${sampleReference}-${analysis_id}-${element_id}`, Observation || '']
                              ])
                          )
                      )
                  );
  
                  // Initialize normesState for usedNormes
                  setNormesState(
                    Object.fromEntries(
                        Object.entries(data.reports[0].samples).flatMap(([sampleReference, sampleArray]) =>
                            sampleArray.flatMap(({ analysis_id, Used_norme }) => [
                                [`${sampleReference}-${analysis_id}-normeUtilisee`, Used_norme || '']
                            ])
                        )
                    )
                );                
  
                  // Initialize normeValuesState for NormeValues
                  setNormeValuesState(
                      Object.fromEntries(
                          Object.entries(data.reports[0].samples).flatMap(([sampleReference, sampleArray]) =>
                              sampleArray.flatMap(({ analysis_id, element_id, Valeur_Norme_Utlise }) => [
                                  [`${sampleReference}-${analysis_id}-${element_id}`, Valeur_Norme_Utlise || '']
                              ])
                          )
                      )
                  );
                  // Réinitialisez la conclusion à partir des données reçues
                setConclusion(data.reports[0].conclusion || '');
              } else {
                  setError('No valid data found');
              }
          })
          .catch((error) => {
              setError(error.message);
          });
      } else {
          setError('Invalid demande_id or department provided');
      }
  }, [id, department]);
  
  
    
  const isFieldVisible = (sampleReference, analysisKey, field) => {
    const sample = groupedSamples[sampleReference];
    const analysis = sample?.analyses[analysisKey];
    const { analysisType } = analysis;
    const { sampleType } = sample;

    if (analysisType === 'Quantitative' && sampleType != 'air') {
        return field === 'normeUtilisee' || field === 'observations' || field === 'valeursNormeUtilisee';
    }
    
    // If not Quantitative and sampleType is not 'air', only validate the conclusion
    return field === 'conclusion';
};
const handleValidateReport = () => {
    let errorMessage = '';

    // Vérifiez si le téléchargement de fichiers est requis
    if (atLeastOneSampleIsAir && files.length === 0) {
        errorMessage = 'Veuillez uploader au moins un fichier avant de valider.';
    }

    // Vérifiez les observations
    Object.entries(observationsState).forEach(([key, value]) => {
        if (value.trim() === '' && isFieldVisible(key.split('-')[0], key.split('-')[1], 'observations')) {
            errorMessage = 'Veuillez remplir toutes les observations.';
        }
    });

    // Vérifiez les normes utilisées
    Object.entries(normesState).forEach(([key, value]) => {
        if (value.trim() === '' && isFieldVisible(key.split('-')[0], key.split('-')[1], 'normeUtilisee')) {
            errorMessage = 'Veuillez remplir toutes les normes utilisées.';
        }
    });

    // Vérifiez les valeurs des normes utilisées
    Object.entries(normeValuesState).forEach(([key, value]) => {
        if (value.trim() === '' && isFieldVisible(key.split('-')[0], key.split('-')[1], 'valeursNormeUtilisee')) {
            errorMessage = 'Veuillez remplir toutes les valeurs des normes utilisées.';
        }
    });

    // Vérifiez la conclusion
    if (conclusion.trim() === '') {
        errorMessage = 'Veuillez entrer une conclusion.';
    }

    // Si un message d'erreur a été trouvé, affichez-le et arrêtez la validation
    if (errorMessage) {
        setValidationError(errorMessage);
        return;
    }

    // Préparez les données pour l'API
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

    // Create FormData object for file upload
    const formData = new FormData();
    formData.append('reportData', JSON.stringify(reportData));
    formData.append('client_id', id);  // Assurez-vous que `id` correspond au client_id correct
    // Ajouter des fichiers à FormData
    files.forEach((file, index) => {
        formData.append(`file${index}`, file);
    });
    // Envoyer les données à l'API
    console.log('Sending report data:', reportData);

    fetch(`${apiBaseUrl}/instnapp/backend/routes/bureau/save_report.php?department=${department}`, {
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
                sessionStorage.setItem('conclusion', conclusion);
                navigate(`/bureau/${department}/rapportfinal/${id}`);
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


  

    const handleValidateRequest = (analysis_id) => {
        const remark = remarksState[analysis_id];

        if (!remark || remark.trim() === '') {
            setValidationError('Veuillez entrer une remarque pour la demande de révision.');
            return;
        }

        const requestData = {
            analysis_id: analysis_id,
            office_remark: remark,
        };

        fetch(`${apiBaseUrl}/instnapp/backend/routes/bureau/request_revision.php?department=${department}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: session_id
            },
            body: JSON.stringify(requestData),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Response from server:', data);
                if (data.success && N1 > 1) {
                    setValidationError('');
                    window.location.reload();
                } else if (data.success && N1 <= 1) {
                    setValidationError('');
                    navigate(`/bureau/${department}/processed-requests`);
                } else {
                    setValidationError(data.message);
                }
            })
            .catch((error) => {
                setValidationError('Erreur lors de l\'enregistrement de la demande de révision.');
            });
    };

    const handleObservationChange = (sampleReference, analysisKey, resultIndex, value) => {
        setObservationsState((prevObservations) => ({
            ...prevObservations,
            [`${sampleReference}-${analysisKey}-${resultIndex}`]: value,
        }));
    };
    const handleNormeValuesChange = (sampleReference, analysisKey, element_id, value) => {
      setNormeValuesState((prevNormeValues) => ({
          ...prevNormeValues,
          [`${sampleReference}-${analysisKey}-${element_id}`]: value,
      }));
  };

    const handleNormeUtiliseeChange = (sampleReference, analysisKey, value) => {
        setNormesState((prevNormes) => ({
            ...prevNormes,
            [`${sampleReference}-${analysisKey}-normeUtilisee`]: value,
        }));
    };

    const handleRemarkChange = (analysisKey, value) => {
        setRemarksState((prevRemarks) => ({
            ...prevRemarks,
            [analysisKey]: value,
        }));
    };

    const toggleRemarkForm = (analysisKey) => {
        setShowRemarkForm((prevShowRemarkForm) => ({
            ...prevShowRemarkForm,
            [analysisKey]: !prevShowRemarkForm[analysisKey],
        }));
    };

    const toggleStandardResults = () => {
        setShowStandardResults(prevShow => !prevShow);
    };

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    if (!data) {
        return <div className="loading-message">Loading...</div>;
    }

    if (!data.samples || typeof data.samples !== 'object') {
        return <div className="error-message">Invalid data format received.</div>;
    }

    const groupedSamples = Object.entries(data.samples).reduce((acc, [sampleType, samples]) => {
        samples.forEach((sample) => {
            if (!acc[sample.sampleReference]) {
                acc[sample.sampleReference] = {
                    sampleType: sample.sampleType,
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
                    analysis_time: sample.analysis_time,
                    file_path : sample.file_path,
                    file_name : sample.file_name,
                    elementsdinteret: [],
                    norme: '',
                    valeurs: {},
                    analysis_id: sample.analysis_id
                };
            }
            acc[sample.sampleReference].analyses[analysisKey].elementsdinteret.push({
                elementDinteret: sample.elementDinteret,
                Unite: sample.Unite,
                Valeur_Moyenne: sample.Valeur_Moyenne,
                Limite_Detection: sample.Limite_Detection,
                Incertitude: sample.Incertitude,
                Valeur_Recommandee: sample.Valeur_Recommandee,
                Valeur_Mesuree: sample.Valeur_Mesuree,
                Reference_Materiel: sample.Reference_Materiel,
                element_id: sample.element_id,
            });
        });
        return acc;
    }, {});

    const groupedSamplesArray = Object.entries(groupedSamples);
    const uniqueSampleCount = groupedSamplesArray.length;

    const getHeaderText = () => {
        switch (department) {
            case 'TFXE':
            case 'HI':
                return 'Valeur Moyenne Mesurée';
            case 'ATN':
                return 'Activité';
            default:
                return 'Valeur Moyenne Mesurée';
        }
    };
    const allSamplesAreAir = groupedSamplesArray.every(([sampleReference, { sampleType }]) => sampleType === 'air');
    const atLeastOneSampleIsAir = groupedSamplesArray.some(([sampleReference, { sampleType }]) => sampleType === 'air');

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
        <div className="rapport-container">
            <div className="header">
                <div className="header-top">
                    <p className="date"><strong>Date:</strong> {new Date().toLocaleDateString()} </p>
                    <div className="analysis-count">
                        <p style={{ color: N1 < N2 ? 'red' : 'green' }}>
                            <strong>{N1}</strong> parmi <strong>{N2}</strong> analyses sont réalisées.
                        </p>
                    </div>
                </div>
                <h1>Résultat d'Analyse</h1>
                <p><strong>Nombre d'échantillons :</strong> {uniqueSampleCount}</p>
                <p><strong>Date de livraison :</strong> {data.dilevery_delay}</p>
            </div>
            {groupedSamplesArray.map(([sampleReference, { sampleType, sampleDetails, analyses }], index) => (
                <div className="sample-section" key={index}>
                    <h3 className="sample-type">Échantillon {index + 1} : {sampleType.toUpperCase()}</h3>
                    <div className="sample-details">
                        <p><strong>Référence Échantillon:</strong> {sampleReference}</p>
                        <p><strong>Lieu de Prélèvement:</strong> {sampleDetails.samplingLocation}</p>
                        <p><strong>Date de Prélèvement:</strong> {sampleDetails.samplingDate}</p>

                        {Object.entries(analyses).map(([analysisKey, { element_id, analysisType, parameter, technique, elementsdinteret, norme, analysis_id, analysis_time, Reference_Materiel, Valeur_Recommandee, Valeur_Mesuree,file_name,file_path }], analysisIndex) => (
                            <div key={analysisKey} className="analysis-section">
                                <h4>Analyse {analysisIndex + 1}: {analysisType} pour {sampleType.toUpperCase()}</h4>
                                {sampleType === 'air' && (
                                    <>
                                    <h2>Vous trouverez les résultats de cette analyse dans l'archive des résultats de l'air.</h2>
                                    <p>Veuillez les consulter et télécharger la première version <strong>CORRECTE</strong> du rapport sans données client au-dessous pour valider.</p>
                                    </>    
                                )}                                                             
                                {department === 'ATN' && (
                                    <p><strong>Durée de mesure :</strong> {analysis_time}</p>
                                )}
                                <div className="analysis-resultas-container">
                                <table className="analysis-table">
                                    <thead>
                                        <tr>
                                            <th>{parameter}</th>
                                            <th>Technique Utilisée</th>
                                            {sampleType !== 'air' && (
                                                <>
                                            <th>Unité</th>
                                            <th>{getHeaderText()}</th>
                                            <th>Limite de Détection</th>
                                            {analysisType === 'Quantitative' && (
                                                <th>
                                                    <input
                                                        type="text"
                                                        placeholder="Entrer la Norme Utilisée"
                                                        value={normesState[`${sampleReference}-${analysisKey}-normeUtilisee`] || norme}
                                                        onChange={(e) => handleNormeUtiliseeChange(sampleReference, analysisKey, e.target.value)}
                                                        className="norme-input"
                                                    />
                                                </th>
                                            )}
                                            {analysisType === 'Quantitative' && (
                                                <th>Observations</th>
                                            )}
                                            </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {elementsdinteret.map((element, resultIndex) => (
                                            <tr key={resultIndex}>
                                                <td>{element.elementDinteret}</td>
                                                <td>{technique}</td>
                                                {sampleType !== 'air' && (
                                                    <>
                                                <td>{element.Unite}</td>
                                                <td>
                                                    {element.Valeur_Moyenne}
                                                    {element.Incertitude && element.Incertitude.trim() !== '' && element.Incertitude !== '0' ? ` ± ${element.Incertitude}` : ''}
                                                </td>
                                                <td>{element.Limite_Detection}</td>
                                                {analysisType === 'Quantitative' && (
                                                  <>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            placeholder="Valeur Norme"
                                                            value={normeValuesState[`${sampleReference}-${analysisKey}-${element.element_id}`] || ''}
                                                            onChange={(e) => handleNormeValuesChange(sampleReference, analysisKey, element.element_id, e.target.value)}
                                                            className="valeur-norme-input"
                                                        />
                                                    </td>
                                                
                                                    <td>
                                                        <input
                                                            type="text"
                                                            placeholder="Observation"
                                                            value={observationsState[`${sampleReference}-${analysisKey}-${element.element_id}`] || ''}
                                                            onChange={(e) => handleObservationChange(sampleReference, analysisKey, element.element_id, e.target.value)}
                                                            className="observation-input"
                                                        />
                                                    </td>
                                                    </>
                                                )}
                                                </>
                                                )}
                                                    {/* <td>{element.element_id}</td> */}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {file_name && (
                                    <>
                                    <td>
                                    <a
                                        href={`${apiBaseUrl}/${file_path}`}
                                        download={file_name}
                                        className="btn-primary"
                                    >
                                        Télécharger les Resultas
                                    </a>
                                    <p className= 'file_name-container'> {file_name}</p>
                                </td>
                                    </>    
                                )} 
                                </div>
                                {sampleType !== 'air' && (
                                    <>
                                <button
                                  className={`btn-standard-results ${showStandardResults ? 'btn-standard-results-close' : ''}`}
                                  onClick={toggleStandardResults}
                                >
                                  {showStandardResults ? 'Fermer' : 'Afficher les résultats standards'}
                                </button>
                                {showStandardResults && (
                                    <div className="standard-results-table">
                                        <h4>Résultats standards pour l'échantillon {index + 1}</h4>
                                        {Object.entries(analyses).map(([analysisKey, { analysisType, elementsdinteret }], analysisIndex) => (
                                            <table key={analysisKey} className="standard-results">
                                                <thead>
                                                    <tr>
                                                        <th>Materiel de Référence</th>
                                                        <th>Élément d'Intérêt</th>
                                                        <th>Unité</th>
                                                        <th>Valeur Mesurée</th>
                                                        <th>Valeur Recomandée</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {elementsdinteret.map((element, resultIndex) => (
                                                        <tr key={resultIndex}>
                                                            <td>{element.Reference_Materiel}</td>
                                                            <td>{element.elementDinteret}</td>
                                                            <td>{element.Unite}</td>
                                                            <td>{element.Valeur_Mesuree}</td>
                                                            <td>{element.Valeur_Recommandee}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ))}
                                    </div>
                                )}
                                </>
                                )}
                                <button
                                  className={`btn-standard-results ${showRemarkForm[analysisKey] ? 'btn-standard-results-close' : ''}`}
                                  onClick={() => toggleRemarkForm(analysisKey)}
                                >
                                  {showRemarkForm[analysisKey] ? 'annuler' : 'Demander une révision du résultat'}
                                </button>
                                {showRemarkForm[analysisKey] && (
                                    <div className="remark-form-container">
                                        <textarea
                                            className="remark-textarea"
                                            value={remarksState[analysisKey] || ''}
                                            onChange={(e) => handleRemarkChange(analysisKey, e.target.value)}
                                            placeholder="Remarque sur l'analyse"
                                        />
                                        <div className="remark-form-buttons">
                                            <button className="validate-button" onClick={() => handleValidateRequest(analysisKey)}>
                                                Valider la demande
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {!allSamplesAreAir && (
                <div className="conclusion-form">
                    <h2>Conclusion</h2>
                    <textarea
                        value={conclusion}
                        onChange={(e) => setConclusion(e.target.value)}
                        placeholder="Entrez la conclusion ici"
                        className="conclusion-textarea"
                    />
                </div>
            )}
            
                <div className="file-upload-form">
                    <h2>première Version du Rapport </h2>
                    <p className='text_file-obligation'> Obligatoire Seulement pour <strong>L'AIR</strong></p>
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
                </div>
            {validationError && <div className="validation-error">{validationError}</div>}
            <div className="button-group">
                <button className="btn-primary" onClick={handleValidateReport}>Valider</button>
            </div>
        </div>
    );
};

export default Rapport;
