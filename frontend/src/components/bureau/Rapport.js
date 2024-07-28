// Rapport.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Rapport.css';

const Rapport = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [showConclusionForm, setShowConclusionForm] = useState(false);
  const [conclusion, setConclusion] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:3000/backend/bureau/rapport.php?demande_id=${id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }
          return response.json();
        })
        .then((data) => {
          console.log('Data received from API:', data); // Log the received data
          if (data.error) {
            setError(data.error);
          } else if (Array.isArray(data) && data.length > 0) {
            setData(data[0]); // Assuming data is an array with a single element
          } else {
            setError('No valid data found');
          }
        })
        .catch((error) => {
          setError(error.message);
        });
    } else {
      setError('Invalid demande_id provided');
    }
  }, [id]);

  const handleGenerateReport = () => {
    setShowConclusionForm(true);
  };

  const handleValidateReport = () => {
    if (conclusion.trim() === '') {
      alert('Veuillez entrer une conclusion.');
      return;
    }

    // Store the conclusion in sessionStorage before navigating
    sessionStorage.setItem('conclusion', conclusion);

    // Navigate to the RapportFinal page with the ID
    navigate(`/bureau/rapportfinal/${id}`);
  };

  const handleCancelConclusion = () => {
    setShowConclusionForm(false);
    setConclusion('');
  };

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!data) {
    return <div className="loading-message">Loading...</div>;
  }

  // Check if data.samples is defined and is an object
  if (!data.samples || typeof data.samples !== 'object') {
    return <div className="error-message">Invalid data format received.</div>;
  }

  // Group analyses by sample
  const groupedAnalyses = Object.entries(data.samples).reduce((acc, [sampleType, samples]) => {
    samples.forEach((sample) => {
      if (!acc[sample.sampleReference]) {
        acc[sample.sampleReference] = {
          sampleType,
          analyses: [],
          sampleDetails: sample, // Store sample details for reference
        };
      }
      // Check if analysis is already added
      const isDuplicate = acc[sample.sampleReference].analyses.some(
        (a) =>
          a.elementDinteret === sample.elementDinteret && // Use elementDinteret here
          a.technique === sample.technique &&
          a.Unite === sample.Unite &&
          a.Valeur_Moyenne === sample.Valeur_Moyenne &&
          a.Valeur_Limite_OMS === sample.Valeur_Limite_OMS &&
          a.Limite_Detection === sample.Limite_Detection &&
          a.Observation === sample.Observation
      );

      if (!isDuplicate) {
        acc[sample.sampleReference].analyses.push(sample);
      }
    });
    return acc;
  }, {});

  // Convert the grouped analyses into an array for rendering
  const groupedAnalysesArray = Object.entries(groupedAnalyses);

  // Count the number of unique samples
  const uniqueSampleCount = groupedAnalysesArray.length;

  return (
    <div className="rapport-container">
      <div className="header">
        <h1>Rapport d'Analyse</h1>
        <p><strong>Demande ID:</strong> {data.demande_id}</p>
        <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
        <p><strong>Nombre d'échantillons uniques :</strong> {uniqueSampleCount}</p>
      </div>

      {groupedAnalysesArray.map(([sampleReference, { sampleType, analyses, sampleDetails }], index) => (
        <div className="sample-section" key={index}>
          <h3 className="sample-type">Type d'Échantillon: {sampleType.toUpperCase()}</h3>
          <div className="sample-details">
            <p><strong>Référence Échantillon:</strong> {sampleReference}</p>
            <p><strong>Lieu de Prélèvement:</strong> {sampleDetails.samplingLocation}</p>
            <p><strong>Date de Prélèvement:</strong> {sampleDetails.samplingDate}</p>
            <p><strong>Prélevé par:</strong> {sampleDetails.sampledBy}</p>

            <table className="analysis-table">
              <thead>
                <tr>
                  <th>Élément d'Intérêt</th>
                  <th>Unité</th>
                  <th>Valeur Moyenne</th>
                  <th>Valeur Limite OMS</th>
                  <th>Limite de Détection</th>
                  <th>Observation</th>
                  <th>Technique Utilisée</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((sample, sampleIndex) => (
                  <tr key={sampleIndex}>
                    <td>{sample.elementDinteret}</td>
                    <td>{sample.Unite}</td>
                    <td>{sample.Valeur_Moyenne}</td>
                    <td>{sample.Valeur_Limite_OMS}</td>
                    <td>{sample.Limite_Detection}</td>
                    <td>{sample.Observation}</td>
                    <td>{sample.technique}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <hr />
          </div>
        </div>
      ))}

      <button className="btn-primary generate-report-button" onClick={handleGenerateReport}>
        Générer le Rapport
      </button>

      {showConclusionForm && (
        <div className="conclusion-form">
          <h3>Conclusion</h3>
          <textarea
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            placeholder="Entrez la conclusion du rapport ici..."
            className="conclusion-textarea"
          />
          <div className="button-group">
            <button className="btn-secondary cancel-button" onClick={handleCancelConclusion}>
              Annuler
            </button>
            <button className="btn-primary validate-button" onClick={handleValidateReport}>
              Valider
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rapport;
