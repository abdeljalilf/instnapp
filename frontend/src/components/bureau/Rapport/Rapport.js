import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Rapport.css';

const Rapport = () => {
  const { id, department } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [conclusion, setConclusion] = useState('');
  const [observationsState, setObservationsState] = useState({});
  const [normesState, setNormesState] = useState({});
  const [validationError, setValidationError] = useState('');
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const [showRemarkForm, setShowRemarkForm] = useState({}); // Pour suivre l'état du formulaire de remarque
  const [remarksState, setRemarksState] = useState({}); // Pour stocker les remarques saisies
  const [N1, setN1] = useState(0);
  const [N2, setN2] = useState(0);


  useEffect(() => {
    if (id && department) {
      fetch(`${apiBaseUrl}/instnapp/backend/routes/bureau/rapport.php?demande_id=${id}&department=${department}`)
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
            setN1(Number(data.N1) || 0); // Assurez-vous que N1 est un nombre
            setN2(Number(data.N2) || 0); // Assurez-vous que N2 est un nombre
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

  const handleValidateReport = () => {
    let errorMessage = '';
  
    Object.entries(observationsState).forEach(([key, value]) => {
      if (value.trim() === '') {
        errorMessage = 'Veuillez remplir toutes les observations.';
      }
    });
  
    Object.entries(normesState).forEach(([key, value]) => {
      if (value.trim() === '') {
        errorMessage = 'Veuillez remplir toutes les normes et leurs valeurs.';
      }
    });
  
    if (conclusion.trim() === '') {
      errorMessage = 'Veuillez entrer une conclusion.';
    }
  
    if (errorMessage) {
      setValidationError(errorMessage);
      return;
    }
  
    // Filtrer les normes pour obtenir uniquement celles avec des element_id valides
    const normeValuesMap = {};
    Object.entries(normesState).forEach(([key, value]) => {
      const [sampleReference, analysisKey, elementDinteret] = key.split('-');
      if (elementDinteret !== 'normeUtilisee' && value.trim() !== '') {
        normeValuesMap[elementDinteret] = value;
      }
    });
  
    const filteredNormeValues = Object.keys(normeValuesMap).map((elementDinteret) => ({
      element_id: elementDinteret,
      Valeur_Norme_Utlise: normeValuesMap[elementDinteret],
    }));
  
    const reportData = {
      usedNormes: Object.entries(normesState).filter(([key]) => key.endsWith('-normeUtilisee')).map(([key, value]) => ({
        analysis_id: key.split('-')[1],
        Used_norme: value,
      })),
      normeValues: filteredNormeValues,
      observations: Object.entries(observationsState).map(([key, value]) => {
        const [sampleReference, analysisKey, resultIndex] = key.split('-');
        return {
          element_id: resultIndex,
          Observation: value,
        };
      }),
      conclusion: conclusion,
      client_id: id, // Ajoutez l'ID du client
      departement: department, // Ajoutez le département
    };
  
    console.log('Sending report data:', reportData);
  
    fetch(`${apiBaseUrl}/instnapp/backend/routes/bureau/save_report.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    })
    .then((response) => response.json())
    .then((data) => {
      console.log('Response from server:', data);
      if (data.success) {
        sessionStorage.setItem('conclusion', conclusion);
        navigate(`/bureau/${department}/rapportfinal/${id}`);
      } else {
        setValidationError(data.message);
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
  
    fetch(`${apiBaseUrl}/instnapp/backend/routes/bureau/request_revision.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
    .then((response) => response.json())
    .then((data) => {
      console.log('Response from server:', data);
      if (data.success) {
        setValidationError('');
        window.location.reload(); // Rafraîchir la page
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

  const handleNormeChange = (sampleReference, analysisKey, elementDinteret, value) => {
    setNormesState((prevNormes) => ({
      ...prevNormes,
      [`${sampleReference}-${analysisKey}-${elementDinteret}`]: value,
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
          sampleType,
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
        element_id: sample.element_id
      });
    });
    return acc;
  }, {});

  const groupedSamplesArray = Object.entries(groupedSamples);
  const uniqueSampleCount = groupedSamplesArray.length;

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
      </div>

      {groupedSamplesArray.map(([sampleReference, { sampleType, sampleDetails, analyses }], index) => (
        <div className="sample-section" key={index}>
          <h3 className="sample-type">Échantillon {index + 1} : {sampleType.toUpperCase()}</h3>
          <div className="sample-details">
            <p><strong>Référence Échantillon:</strong> {sampleReference}</p>
            <p><strong>Lieu de Prélèvement:</strong> {sampleDetails.samplingLocation}</p>
            <p><strong>Date de Prélèvement:</strong> {sampleDetails.samplingDate}</p>
            <p><strong>Prélevé par:</strong> {sampleDetails.sampledBy}</p>

            {Object.entries(analyses).map(([analysisKey, { analysisType, parameter, technique, elementsdinteret, norme, valeurs, analysis_id }], analysisIndex) => (
              <div key={analysisKey} className="analysis-section">
                <h4>Analyse {analysisIndex + 1}: {analysisType} pour {sampleType.toUpperCase()}</h4>
                <p><strong>Analysis ID:</strong> {analysis_id}</p>
                <table className="analysis-table">
                  <thead>
                    <tr>
                      <th>Élément d'Intérêt</th>
                      <th>Unité</th>
                      <th>Valeur Moyenne</th>
                      <th>Limite de Détection</th>
                      <th>Technique Utilisée</th>
                      <th>
                        <input
                          type="text"
                          placeholder="Entrer la Norme Utilisée"
                          value={normesState[`${sampleReference}-${analysisKey}-normeUtilisee`] || norme}
                          onChange={(e) => handleNormeUtiliseeChange(sampleReference, analysisKey, e.target.value)}
                          className="norme-input"
                        />
                      </th>
                      <th>Observations </th>
                    </tr>
                  </thead>
                  <tbody>
                    {elementsdinteret.map((element, resultIndex) => (
                      <tr key={resultIndex}>
                        <td>{element.elementDinteret}</td>
                        <td>{element.Unite}</td>
                        <td>
                        {element.Valeur_Moyenne}
                        {element.Incertitude && element.Incertitude.trim() !== '' && element.Incertitude !== '0' ? ` ± ${element.Incertitude}` : ''}
                        </td>
                        <td>{element.Limite_Detection}</td>
                        <td>{technique}</td>
                        <td>
                          <input
                            type="text"
                            placeholder="Valeur Norme"
                            value={normesState[`${sampleReference}-${analysisKey}-${element.element_id}`] || ''}
                            onChange={(e) => handleNormeChange(sampleReference, analysisKey, element.element_id, e.target.value)}
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
                        <td>
                          <strong>Element ID:</strong> {element.element_id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Bouton pour demander la révision */}
                <button className="request-revision-button" onClick={() => toggleRemarkForm(analysisKey)}>
                    Demander révision d'analyse
                </button>

                {/* Formulaire de remarque conditionnel */}
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
                            <button className="cancel-button" onClick={() => toggleRemarkForm(analysisKey)}>
                                Annuler la demande
                            </button>
                        </div>
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="conclusion-form">
        <h3>Conclusion</h3>
        <textarea
          className="conclusion-textarea"
          value={conclusion}
          onChange={(e) => setConclusion(e.target.value)}
          placeholder="Entrez votre conclusion ici..."
        />
        {validationError && <div className="validation-error">{validationError}</div>}
        <div className="button-group">
          <button className="btn-primary" onClick={handleValidateReport}>Valider</button>
        </div>
      </div>
    </div>
  );
};

export default Rapport;
