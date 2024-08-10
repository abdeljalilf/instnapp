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
  const [qualiteResults, setQualiteResults] = useState([]);
  const [analyseTime, setAnalyseTime] = useState(''); // New state for durée d'analyse
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
          unite: '', // Default value, will be set based on department
          valeurMoyenne: '',
          incertitude: '',
          limiteDetection: 1, // Default value
          status: 'détectable' // Default value
        })));
        setQualiteResults(response.data.elementsdinteret.map(element => ({
          id: element.id,
          element: element.elementDinteret,
          referenceMateriel: '', // Default value
          unite: '', // Default value, will be set based on department
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

  const getUnitOptions = (departement) => {
    if (departement === 'ATN') {
      return [{ value: 'Bq/Kg', label: 'Bq/Kg' }];
    } else if (departement === 'HI') {
      return [
        { value: '', label: '' },
        { value: 'ppm', label: 'ppm' },
        { value: 'mg/L', label: 'mg/L' },
        { value: 'mV', label: 'mV' },
        { value: '%', label: '%' },
        { value: 'meq/L', label: 'meq/L' },
        { value: 'other', label: 'Autre (Saisir)' }
      ];
    }
    return [];
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
      analyseTime: analysisDetails.departement === 'ATN' ? analyseTime : null, // Include analyseTime if department is ATN
      results: resultsPayload,
      qualite: qualitePayload
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
          {analysisDetails.departement === 'ATN' && (
            <div className="duree-analyse-container">
              <label htmlFor="analyseTime" className="duree-analyse-label"> Durée d'analyse :</label>
              <input
                type="text"
                id="analyseTime"
                value={analyseTime}
                onChange={(e) => setAnalyseTime(e.target.value)}
                className="duree-analyse-input"
                
              />
            </div>
          )}

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
                      {getUnitOptions(analysisDetails.departement).map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {result.unite === 'other' && (
                      <input
                        type="text"
                        value={result.unite === 'other' ? '' : result.unite}
                        onChange={(e) => handleResultChange(index, 'unite', e.target.value)}
                        placeholder="Enter unit"
                      />
                    )}
                  </td>
                  <td>
                    {analysisDetails.analysisType === 'Quantitative' ? (
                      <input
                        type="text"
                        value={result.valeurMoyenne}
                        onChange={(e) => handleResultChange(index, 'valeurMoyenne', e.target.value)}
                        disabled={result.status === 'non détectable'}
                      />
                    ) : 'N/A'}
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
                      type="number"
                      value={result.limiteDetection}
                      onChange={(e) => handleResultChange(index, 'limiteDetection', e.target.value)}
                      disabled={result.status === 'non détectable'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="qualite-section">
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
                      {getUnitOptions(analysisDetails.departement).map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {result.unite === 'other' && (
                      <input
                        type="text"
                        value={result.unite === 'other' ? '' : result.unite}
                        onChange={(e) => handleQualiteChange(index, 'unite', e.target.value)}
                        placeholder="Enter unit"
                      />
                    )}
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
        </section>

        <div className="button-section">
          <button onClick={handleSaveResults}>Enregistrer les résultats</button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetails;
