import React, { useState } from 'react';
import './labo.css';

const Labo = () => {
  const labos = ['TFXE', 'ATN', 'HI']; // Hardcoded list of departments
  const [selectedLabo, setSelectedLabo] = useState('');
  const [analyses, setAnalyses] = useState([]);

  const handleLaboChange = (event) => {
    const labo = event.target.value;
    setSelectedLabo(labo);
    // Fetch analyses for the selected labo
    fetch('http://localhost/instnapp/backend/routes/labo.php', {
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
                <th>Analysis ID</th>
                <th>Echantillon ID</th>
                <th>Analysis Type</th>
                <th>Parameter</th>
                <th>Technique</th>
              </tr>
            </thead>
            <tbody>
              {analyses.map(analysis => (
                <tr key={analysis.id}>
                  <td>{analysis.id}</td>
                  <td>{analysis.echantillon_id}</td>
                  <td>{analysis.analysisType}</td>
                  <td>{analysis.parameter}</td>
                  <td>{analysis.technique}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Labo;
