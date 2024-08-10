import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './analysisdetails.css';

const AnalysisDetails = () => {
  const { id: analysisId } = useParams();
  const navigate = useNavigate();
  const [analysisDetails, setAnalysisDetails] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [elementsResults, setElementsResults] = useState([]);
  const [qualiteResults, setQualiteResults] = useState([]); // New state for Analyse Qualité
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    axios.get(`${apiBaseUrl}/instnapp/backend/routes/laboratoire/analysisDetails.php`, {
      params: { id: analysisId }
    })
      .then(response => {
        setAnalysisDetails(response.data);
        setElementsResults(response.data.elementsdinteret.map(element => ({
          id: element.id,
          element: element.elementDinteret,
          unite: 'g/L', // Default value
          valeurMoyenne: '',
          incertitude: '',
          limiteDetection: 1, // Default value
          status: 'détectable' // Default value
        })));
        setQualiteResults(response.data.elementsdinteret.map(element => ({
          id: element.id,
          element: element.elementDinteret,
          referenceMateriel: '', // Default value
          unite: 'g/L', // Default value
          valeurRecommandee: '',
          valeurMesuree: ''
        })));
      })
      .catch(error => alert('Error fetching analysis details: ' + error));
  }, [analysisId, apiBaseUrl]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleResultChange = (index, field, value) => {
    const newResults = [...elementsResults];
    if (field === 'status') {
      newResults[index][field] = value;
      if (value === 'non détectable') {
        newResults[index].valeurMoyenne = 'N/A';
        newResults[index].incertitude = 'N/A';
      } else {
        newResults[index].valeurMoyenne = '';
        newResults[index].incertitude = '';
      }
    } else {
      newResults[index][field] = value;
    }
    setElementsResults(newResults);
  };

  const handleQualiteChange = (index, field, value) => {
    const newQualiteResults = [...qualiteResults];
    newQualiteResults[index][field] = value;
    setQualiteResults(newQualiteResults);
  };

  const handleSaveResults = () => {
    const resultsPayload = elementsResults.map(result => ({
      elementsdinteretId: result.id,
      unite: result.unite,
      valeurMoyenne: result.status === 'non détectable' ? 'non détecté' : result.valeurMoyenne,
      incertitude: result.status === 'non détectable' ? 'non détecté' : result.incertitude,
      limiteDetection: result.limiteDetection
    }));

    const qualitePayload = qualiteResults.map(result => ({
      elementsdinteretId: result.id,
      referenceMateriel: result.referenceMateriel,
      unite: result.unite,
      valeurRecommandee: result.valeurRecommandee,
      valeurMesuree: result.valeurMesuree
    }));

    axios.post(`${apiBaseUrl}/instnapp/backend/routes/laboratoire/analysisDetails.php`, {
      analysisId: analysisId,
      results: resultsPayload,
      qualite: qualitePayload // Add Analyse Qualité results to the payload
    })
      .then(response => {
        alert('Résultats validés avec succès');
        navigate('/laboratoire');
      })
      .catch(error => {
        alert('Error saving results: ' + error);
      });
  };

  if (!analysisDetails) {
    return <div>Loading...</div>;
  }

  if (analysisDetails.error) {
    return <div>{analysisDetails.error}</div>;
  }

  return (
    <div className='labo-analysis'>
      <div className="details-container">
        <h1>Analysis Details</h1>
        <table>
          <tbody>
            <tr>
              <td>ID de l'analyse:</td>
              <td>{analysisDetails.id}</td>
            </tr>
            <tr>
              <td>Parameter:</td>
              <td>{analysisDetails.parameter}</td>
            </tr>
            <tr>
              <td>Sample Reference:</td>
              <td>{analysisDetails.sampleReference}</td>
            </tr>
            <tr>
              <td>Analysis Type:</td>
              <td>{analysisDetails.analysisType}</td>
            </tr>
            <tr>
              <td>Technique:</td>
              <td>{analysisDetails.technique}</td>
            </tr>
            <tr>
              <td>Elements d'interet: </td>
              <td>{analysisDetails.elementsdinteret.map(el => el.elementDinteret).join(', ')}</td>
            </tr>
            <tr>
              <td>Sample Type:</td>
              <td>{analysisDetails.sampleType}</td>
            </tr>
            <tr>
              <td>Sampling Location:</td>
              <td>{analysisDetails.samplingLocation}</td>
            </tr>
            <tr>
              <td>Sampling Date:</td>
              <td>{analysisDetails.samplingDate}</td>
            </tr>
          </tbody>
        </table>

        <section className="file-upload-section">
          <h2>Upload Results</h2>
          <input type="file" onChange={handleFileChange} />
          {selectedFile && <p>{selectedFile.name} - {selectedFile.size} bytes</p>}
        </section>

        <section className="results-section">
          <h2>Enter Results</h2>
          <table>
            <thead>
              <tr>
                <th>Element</th>
                <th>Status</th>
                <th>Unité</th>
                <th>Valeur Moyenne</th>
                {analysisDetails.analysisType === 'Quantitative' && <th>Incertitude</th>}
                <th>Limite Détection</th>
              </tr>
            </thead>
            <tbody>
              {elementsResults.map((result, index) => (
                <tr key={index}>
                  <td>{result.element}</td>
                  <td>
                    <select
                      value={result.status}
                      onChange={(e) => handleResultChange(index, 'status', e.target.value)}
                    >
                      <option value="détectable">détectable</option>
                      <option value="non détectable">non détectable</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={result.unite}
                      onChange={(e) => handleResultChange(index, 'unite', e.target.value)}
                    >
                      <option value="g/L">g/L</option>
                      <option value="mg/L">mg/L</option>
                      <option value="µg/L">µg/L</option>
                      <option value="g/Kg">g/Kg</option>
                      <option value="mg/Kg">mg/Kg</option>
                      <option value="µg/Kg">µg/Kg</option>
                    </select>
                  </td>
                  <td>
                    {analysisDetails.analysisType === 'Quantitative' ? (
                      <input
                        type="text"
                        value={result.valeurMoyenne}
                        onChange={(e) => handleResultChange(index, 'valeurMoyenne', e.target.value)}
                        disabled={result.status === 'non détectable'}
                      />
                    ) : (
                      <select
                        value={result.valeurMoyenne}
                        onChange={(e) => handleResultChange(index, 'valeurMoyenne', e.target.value)}
                        disabled={result.status === 'non détectable'}
                      >
                        <option value="">Select</option>
                        <option value="Majeur">Majeur</option>
                        <option value="Mineur">Mineur</option>
                        <option value="Trace">Trace</option>
                      </select>
                    )}
                  </td>
                  {analysisDetails.analysisType === 'Quantitative' && (
                    <td>
                      <input
                        type="text"
                        value={result.incertitude}
                        onChange={(e) => handleResultChange(index, 'incertitude', e.target.value)}
                        disabled={result.status === 'non détectable'}
                      />
                    </td>
                  )}
                  <td>
                    <input
                      type="text"
                      value={result.limiteDetection}
                      onChange={(e) => handleResultChange(index, 'limiteDetection', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <h2>Analyse Qualité</h2>
          <table>
            <thead>
              <tr>
                <th>Element</th>
                <th>Reference Matériel</th>
                <th>Unité</th>
                <th>Valeur Recommandée</th>
                <th>Valeur Mesurée</th>
              </tr>
            </thead>
            <tbody>
              {qualiteResults.map((result, index) => (
                <tr key={index}>
                  <td>{result.element}</td>
                  <td>
                    <input
                      type="text"
                      value={result.referenceMateriel}
                      onChange={(e) => handleQualiteChange(index, 'referenceMateriel', e.target.value)}
                    />
                  </td>
                  <td>
                    <select
                      value={result.unite}
                      onChange={(e) => handleQualiteChange(index, 'unite', e.target.value)}
                    >
                      <option value="g/L">g/L</option>
                      <option value="mg/L">mg/L</option>
                      <option value="µg/L">µg/L</option>
                      <option value="g/Kg">g/Kg</option>
                      <option value="mg/Kg">mg/Kg</option>
                      <option value="µg/Kg">µg/Kg</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={result.valeurRecommandee}
                      onChange={(e) => handleQualiteChange(index, 'valeurRecommandee', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={result.valeurMesuree}
                      onChange={(e) => handleQualiteChange(index, 'valeurMesuree', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={handleSaveResults} className="valider-button">Valider</button>
        </section>
      </div>
    </div>
  );
};

export default AnalysisDetails;
