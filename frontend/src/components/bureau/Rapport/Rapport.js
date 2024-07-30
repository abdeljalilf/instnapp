import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Rapport.css';

const Rapport = () => {
  const { id, department } = useParams(); // Ajoutez le paramètre 'department'
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [conclusion, setConclusion] = useState('');
  const [observationsState, setObservationsState] = useState({});
  const [normesState, setNormesState] = useState({});
  const [validationError, setValidationError] = useState('');
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    if (id && department) { // Vérifiez si 'id' et 'department' sont présents
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
          } else if (Array.isArray(data) && data.length > 0) {
            setData(data[0]);
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

    // Check if all observations are filled
    Object.entries(observationsState).forEach(([key, value]) => {
      if (value.trim() === '') {
        errorMessage = 'Veuillez remplir toutes les observations.';
      }
    });

    // Check if all normes are filled
    Object.entries(normesState).forEach(([key, value]) => {
      if (value.trim() === '') {
        errorMessage = 'Veuillez remplir toutes les normes et leurs valeurs.';
      }
    });

    // Check if conclusion is filled
    if (conclusion.trim() === '') {
      errorMessage = 'Veuillez entrer une conclusion.';
    }

    if (errorMessage) {
      setValidationError(errorMessage);
      return;
    }

    // Save conclusion to sessionStorage and navigate
    sessionStorage.setItem('conclusion', conclusion);
    navigate(`/bureau/rapportfinal/${id}`);
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
      const analysisKey = `${sample.analysisType}-${sample.parameter}`;
      if (!acc[sample.sampleReference].analyses[analysisKey]) {
        acc[sample.sampleReference].analyses[analysisKey] = {
          analysisType: sample.analysisType,
          parameter: sample.parameter,
          technique: sample.technique,
          elementsdinteret: [],
          norme: '', // Default value for norme
          valeurs: {} // Object to store norme values for each element
        };
      }
      acc[sample.sampleReference].analyses[analysisKey].elementsdinteret.push({
        elementDinteret: sample.elementDinteret,
        Unite: sample.Unite,
        Valeur_Moyenne: sample.Valeur_Moyenne,
        Limite_Detection: sample.Limite_Detection
      });
    });
    return acc;
  }, {});

  const groupedSamplesArray = Object.entries(groupedSamples);
  const uniqueSampleCount = groupedSamplesArray.length;

  return (
    <div className="rapport-container">
      <div className="header">
        <h1>Rapport d'Analyse</h1>
        <p><strong>Demande ID:</strong> {data.demande_id}</p>
        <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
        <p><strong>Nombre d'échantillons uniques :</strong> {uniqueSampleCount}</p>
      </div>

      {groupedSamplesArray.map(([sampleReference, { sampleType, sampleDetails, analyses }], index) => (
        <div className="sample-section" key={index}>
          <h3 className="sample-type">Échantillon {index + 1} : {sampleType.toUpperCase()}</h3>
          <div className="sample-details">
            <p><strong>Référence Échantillon:</strong> {sampleReference}</p>
            <p><strong>Lieu de Prélèvement:</strong> {sampleDetails.samplingLocation}</p>
            <p><strong>Date de Prélèvement:</strong> {sampleDetails.samplingDate}</p>
            <p><strong>Prélevé par:</strong> {sampleDetails.sampledBy}</p>

            {Object.entries(analyses).map(([analysisKey, { analysisType, parameter, technique, elementsdinteret, norme, valeurs }], analysisIndex) => (
              <div key={analysisKey} className="analysis-section">
                <h4>Analyse {analysisIndex + 1}: {analysisType} pour {sampleType.toUpperCase()}</h4>
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
                      <th>Observations</th>
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
                        <td>
                        <input
                            type="text"
                            placeholder="Valeur Norme"
                            value={normesState[`${sampleReference}-${analysisKey}-${resultIndex}`] || ''}
                            onChange={(e) => handleNormeChange(sampleReference, analysisKey, resultIndex, e.target.value)}
                            className="valeur-norme-input"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="Observation"
                            value={observationsState[`${sampleReference}-${analysisKey}-${resultIndex}`] || ''}
                            onChange={(e) => handleObservationChange(sampleReference, analysisKey, resultIndex, e.target.value)}
                            className="observation-input"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
