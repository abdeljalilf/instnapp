import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './analysislist.css';

const AnalysisList = () => {
  const { departement } = useParams(); // Extract department from URL
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true); // State for loading
  const [error, setError] = useState(null); // State for handling errors
  const [search, setSearch] = useState(''); // State for search input
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const session_id = localStorage.getItem('session_id'); // Retrieve session ID

  useEffect(() => {
    if (departement && apiBaseUrl && session_id) {
      fetch(`${apiBaseUrl}/instnapp/backend/routes/laboratoire/laboratoire.php?department=${departement}`, {
        method: 'POST',
        headers: {
          Authorization: session_id // Ensure correct Authorization header
        },
        body: JSON.stringify({ department: departement }), // Use department from URL
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          setAnalyses(data);
          setLoading(false); // Update loading state
        })
        .catch(error => {
          console.error('Error fetching analyses:', error);
          setError('Erreur lors du chargement des analyses.'); // Error message
          setLoading(false); // Handle loading state in case of error
        });
    } else {
      console.error('Missing parameters: departement, apiBaseUrl, or session_id');
    }
  }, [departement, apiBaseUrl, session_id]);

  const getStatusMessage = (validated) => {
    switch (validated) {
      case 'office_step_1':
        return 'Analyse à effectuer';
      case 'office_reject':
        return 'Résultats à corriger';
      default:
        return '';
    }
  };

  // Filter analyses based on search input
  const filteredAnalyses = analyses.filter(analysis =>
    analysis.sampleReference?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>; // Show loading message if data isn't loaded yet
  }

  if (error) {
    return <div>{error}</div>; // Show error message
  }

  return (
    <div className="analyses-container">
      <div className="analyses-table">
        <div className="form-header">
          <h2>Liste des analyses</h2>
        </div>
        <div className="toolbar">
          <label htmlFor="search" className="search-label">Rechercher :</label>
          <br />
          <input
            type="text"
            id="search"
            placeholder="Entrez votre recherche..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        {filteredAnalyses.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID analyse</th>
                <th>Référence échantillon</th>
                <th>Opération demandée</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnalyses.map(analysis => (
                <tr key={analysis.analysisId}>
                  <td>{analysis.analysisId}</td>
                  <td>{analysis.sampleReference}</td>
                  <td>
                    Analyse {analysis.analysisType} de {analysis.parameter} par {analysis.technique} <br />
                    Éléments d'intérêt: {analysis.elementDinteret}
                  </td>
                  <td>{getStatusMessage(analysis.validated)}</td>
                  <td>
                    <Link to={`/laboratoire/${departement}/analysis-details/${analysis.analysisId}`}>
                      <button className="result-button">Ajouter les résultats</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-results-message">Aucun résultat trouvé pour votre recherche.</div>
        )}
      </div>
    </div>
  );
};

export default AnalysisList;
