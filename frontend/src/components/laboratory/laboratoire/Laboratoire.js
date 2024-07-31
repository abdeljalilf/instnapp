  import React, { useState } from 'react';
  import { Link } from 'react-router-dom';
  import './Laboratoire.css';

  const Laboratoire = () => {
    const labos = ['TFXE', 'ATN', 'HI'];
    const [selectedLabo, setSelectedLabo] = useState('');
    const [analyses, setAnalyses] = useState([]);
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

    const handleLaboChange = (event) => {
      const labo = event.target.value;
      setSelectedLabo(labo);
      fetch(`${apiBaseUrl}/instnapp/backend/routes/laboratoire/laboratoire.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ labo }),
      })
        .then(response => response.json())
        .then(data => setAnalyses(data))
        .catch(error => console.error('Error fetching analyses:', error));
    };

    return (
      <div className="labo-container">
        <div className="labo-header">
          <h1>Select Labo</h1>
        </div>
        <div className="labo-select-group">
          <select value={selectedLabo} onChange={handleLaboChange} className="labo-select">
            <option value="" disabled>Select a labo</option>
            {labos.map(labo => (
              <option key={labo} value={labo}>{labo}</option>
            ))}
          </select>
        </div>
        {analyses.length > 0 && (
          <div className="analyses-table">
            <table>
              <thead>
                <tr>
                  <th>ID analyse</th>
                  <th>Référence échantillon</th>
                  <th>Opération demandé</th>
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
                    <td>
                      <Link to={`analysis-details/${analysis.analysisId}`}>
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

  export default Laboratoire;
