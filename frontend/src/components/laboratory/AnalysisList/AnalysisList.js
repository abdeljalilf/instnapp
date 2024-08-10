import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './analysislist.css';

const Analyses = () => {
  const { selectedLabo } = useParams();
  const [analyses, setAnalyses] = useState([]);
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetch(`${apiBaseUrl}/instnapp/backend/routes/laboratoire/laboratoire.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ labo: selectedLabo }),
    })
      .then(response => response.json())
      .then(data => setAnalyses(data))
      .catch(error => console.error('Error fetching analyses:', error));
  }, [selectedLabo, apiBaseUrl]);

  const getStatusMessage = (validated) => {
    if (validated === 'office_step_1') {
      return 'résultats à analyser';
    } else if (validated === 'office_reject') {
      return 'résultats à corriger';
    } else {
      return '';
    }
  };

  return (
    <div className="analyses-container">
      {analyses.length > 0 && (
        <div className="analyses-table">
          <table>
            <thead>
              <tr>
                <th>ID analyse</th>
                <th>Référence échantillon</th>
                <th>Opération demandé</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {analyses.map(analysis => (
                <tr key={analysis.analysisId}>
                  <td>{analysis.analysisId}</td>
                  <td>{analysis.sampleReference}</td>
                  <td>
                    Analyse {analysis.analysisType} de {analysis.parameter} par {analysis.technique} <br />
                    Éléments d'intérêt: {analysis.elementDinteret}
                  </td>
                  <td>{getStatusMessage(analysis.validated)}</td>
                  <td>
                    <Link to={`/laboratoire/analysis-details/${analysis.analysisId}`}>
                      <button className="result-button">Ajouter les resultats</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Analyses;
