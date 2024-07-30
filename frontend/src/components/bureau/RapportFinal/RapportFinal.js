// RapportFinal.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './RapportFinal.css';

const RapportFinal = () => {
  return (
      <div>
          <h1>RapportFinal pas encore</h1>
          {/* Add functionality for displaying history and statistics of past analyses */}
      </div>
  );
};

export default RapportFinal;
/*
const RapportFinal = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [conclusion, setConclusion] = useState('');
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  
  useEffect(() => {
    if (id) {
      fetch(`${apiBaseUrl}/instnapp/backend/routes/bureau/rapport.php?demande_id=${id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }
          return response.json();
        })
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setData(data[0]); // Assuming data is an array with a single element
          }
        })
        .catch((error) => {
          setError(error.message);
        });
    } else {
      setError('Invalid demande_id provided');
    }
  }, [id]);

  useEffect(() => {
    const storedConclusion = sessionStorage.getItem('conclusion');
    if (storedConclusion) {
      setConclusion(storedConclusion);
    }
  }, []);

  if (error) {
    return <div className="error-message">Erreur : {error}</div>;
  }

  if (!data) {
    return <div className="loading-message">Chargement...</div>;
  }

  const groupedAnalyses = Object.entries(data.samples).reduce((acc, [sampleType, samples]) => {
    samples.forEach((sample) => {
      if (!acc[sample.sampleReference]) {
        acc[sample.sampleReference] = {
          sampleType,
          samplingLocation: sample.samplingLocation,
          samplingDate: sample.samplingDate,
          sampledBy: sample.sampledBy,
          analyses: [],
        };
      }

      const isDuplicate = acc[sample.sampleReference].analyses.some(
        (a) =>
          a.analysisType === sample.analysisType &&
          a.parameter === sample.parameter &&
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

  const groupedAnalysesArray = Object.entries(groupedAnalyses);
  const uniqueSampleCount = groupedAnalysesArray.length;

  return (
    <div className="rapport-final-container">
      <header className="report-header">
        <h1>RÉSULTATS D'ANALYSES</h1>
        <p><strong>Référence Client :</strong> {data.clientReference}</p>
        <p className="date-location">
          <strong>Antananarivo, le</strong> {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      <section className="client-info">
        <h2>Informations du Client</h2>
        <p><strong>Nom :</strong> {data.client_name}</p>
        <p><strong>Adresse :</strong> {data.client_address}</p>
        <p><strong>Téléphone :</strong> {data.client_phone}</p>
        <p><strong>Nombre d’échantillons :</strong> {uniqueSampleCount} échantillon{uniqueSampleCount > 1 ? 's' : ''}.</p>
        <p><strong>Date d'arrivée :</strong> {new Date(data.date_arrive).toLocaleDateString()}</p>
      </section>

      <section className="conclusion-section">
        <h2>1. Conclusion</h2>
        <p>{conclusion}</p>
      </section>

      <section className="results-section">
        <h2>2. Résultats</h2>
        <p>Les résultats d’analyses sont reportés dans les tableaux ci-dessous.</p>
      </section>

      {groupedAnalysesArray.map(([sampleReference, { sampleType, samplingLocation, samplingDate, sampledBy, analyses }], index) => (
        <div key={index} className="sample-table">
          <h3>
            Echantillon numéro {index + 1} : {sampleType} - Code {sampleReference}
          </h3>
          <p><strong>Lieu de Prélèvement :</strong> {samplingLocation}</p>
          <p><strong>Date de Prélèvement :</strong> {new Date(samplingDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><strong>Prélevé par :</strong> {sampledBy}</p>
          <table>
            <thead>
              <tr>
                <th>Type d'analyse</th>
                <th>Paramètre</th>
                <th>Technique</th>
                <th>Unité</th>
                <th>Valeur Moyenne</th>
                <th>Valeur Limite OMS</th>
                <th>Limite de Détection</th>
                <th>Observation</th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((sample, idx) => (
                <tr key={idx}>
                  <td>{sample.analysisType}</td>
                  <td>{sample.parameter}</td>
                  <td>{sample.technique}</td>
                  <td>{sample.Unite}</td>
                  <td>{sample.Valeur_Moyenne}</td>
                  <td>{sample.Valeur_Limite_OMS}</td>
                  <td>{sample.Limite_Detection}</td>
                  <td>{sample.Observation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <footer className="report-footer">
        <p>Fait à Antananarivo, le {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p>Chef du département des analyses</p>
      </footer>

      <div className="signature-space"></div>
    </div>
  );
};

export default RapportFinal;
*/