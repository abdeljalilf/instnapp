import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './analysisdetails.css';

const AnalysisDetails = () => {
  const { id: analysisId } = useParams();
  const [analysisDetails, setAnalysisDetails] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [elementsResults, setElementsResults] = useState([]);
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    axios.get(`${apiBaseUrl}/instnapp/backend/routes/laboratoire/analysisDetails.php`, {
      params: { id: analysisId }
    })
      .then(response => {
        setAnalysisDetails(response.data);
        // Initialize results with the elements of interest
        setElementsResults(response.data.elementsdinteret.map(element => ({
          id: element.id,
          element: element.elementDinteret,
          unite: 'g/L', // Default value
          valeurMoyenne: '',
          incertitude: '',
          status: 'detectable', // Default value
          limiteDetection: 1 // Default value
        })));
      })
      .catch(error => alert('Error fetching analysis details: ' + error));
  }, [analysisId, apiBaseUrl]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleResultChange = (index, field, value) => {
    const newResults = [...elementsResults];
    newResults[index][field] = value;
    if (field === 'status' && value === 'non_detectable') {
      newResults[index]['valeurMoyenne'] = 'Non détecté';
      newResults[index]['incertitude'] = 'Non détecté';
    }
    setElementsResults(newResults);
  };

  const handleSaveResults = () => {
    const resultsPayload = elementsResults.map(result => ({
      elementsdinteretId: result.id,
      unite: result.unite,
      valeurMoyenne: result.valeurMoyenne,
      incertitude: result.incertitude,
      limiteDetection: result.limiteDetection
    }));

    axios.post(`${apiBaseUrl}/instnapp/backend/routes/laboratoire/analysisDetails.php`, {
      elementsdinteretId: elementsResults[0].id, // Adjust to fit the expected payload structure if necessary
      analysisId: analysisId, // Added new parameter
      results: resultsPayload
    })
      .then(response => {
        alert('Résultats validés avec succès'); // Success message
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
              <th>Valeur Moyenne</th>
              <th>Incertitude</th>
              <th>Unité</th>
              <th>Limite Détection</th>
              <th>Observation</th>
              <th>Lim</th>
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
                    <option value="detectable">Détectable</option>
                    <option value="non_detectable">Non Détectable</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={result.status === 'non_detectable' ? 'N/A' : result.valeurMoyenne}
                    onChange={(e) => handleResultChange(index, 'valeurMoyenne', e.target.value)}
                    disabled={result.status === 'non_detectable'}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={result.status === 'non_detectable' ? 'N/A' : result.incertitude}
                    onChange={(e) => handleResultChange(index, 'incertitude', e.target.value)}
                    disabled={result.status === 'non_detectable'}
                  />
                </td>
                <td>
                  <select
                    value={result.unite}
                    onChange={(e) => handleResultChange(index, 'unite', e.target.value)}
                  >
                    <option value="g/L">g/L</option>
                    <option value="mg/L">mg/L</option>
                    <option value="µg/L">µg/L</option>
                  </select>
                </td>
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
        <button onClick={handleSaveResults} className="valider-button">Valider</button>
      </section>
    </div>
  );
};

export default AnalysisDetails;
