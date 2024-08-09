import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Chart } from 'chart.js/auto';

const Department = () => {
  const { department } = useParams(); // Retrieve the department from the URL
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  const chartRef = useRef(null);

  useEffect(() => {
    // Fetch data from the API
    axios
      .get(`${apiBaseUrl}/instnapp/backend/routes/bureau/dashboard.php?department=${department}`)
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        setError(error);
      });
  }, [department, apiBaseUrl]);

  useEffect(() => {
    if (data && chartRef.current) {
      // Destroy the previous chart if it exists
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }

      // Initialize the new chart
      const ctx = chartRef.current.getContext('2d');
      chartRef.current.chart = new Chart(ctx, {
        type: 'line', // Choose the chart type
        data: {
          labels: data.demandes_par_mois.map((d) => `Month ${d.month}`), // Label for each month
          datasets: [
            {
              label: 'Demandes par Mois',
              data: data.demandes_par_mois.map((d) => d.count),
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
          ],
        },
      });
    }
  }, [data]);

  if (error) return <div>Erreur: {error.message}</div>;
  if (!data) return <div>Chargement...</div>;

  // Calculate statistics
  const demandesRecues = data.demandes_recues;
  const rapportsGeneres = data.rapports_generes;
  const rapportsEnAttente = data.rapports_en_attente;
  const echantillonsParType = data.echantillons_par_type;
  const analysesParType = data.analyses_par_type;
  const demandesParMois = data.demandes_par_mois;
  const statusDemandes = data.status_demandes;

  return (
    <div className="dashboard">
      <h1>Dashboard du Département: {department}</h1>

      <section>
        <h2>Sur les trois derniers mois</h2>
        <div>
          <strong>Nombre de Demandes Reçues: </strong>
          {demandesRecues.recent}
        </div>
        <div>
          <strong>Nombre de Rapports Générés: </strong>
          {rapportsGeneres.recent}
        </div>
        <div>
          <strong>Nombre de Rapports en Attente: </strong>
          {rapportsEnAttente.recent}
        </div>
        <div>
          <strong>Statistiques sur les Échantillons par Type: </strong>
          <ul>
            {echantillonsParType.recent.map((echantillon, index) => (
              <li key={index}>
                {echantillon.sampleType}: {echantillon.count}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <strong>Statistiques sur les Analyses par Type: </strong>
          <ul>
            {analysesParType.recent.map((analyse, index) => (
              <li key={index}>
                {analyse.analysisType}: {analyse.count}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2>Sur l'année</h2>
        <div>
          <strong>Nombre de Demandes Reçues: </strong>
          {demandesRecues.year}
        </div>
        <div>
          <strong>Nombre de Rapports Générés: </strong>
          {rapportsGeneres.year}
        </div>
        <div>
          <strong>Statistiques sur les Échantillons par Type: </strong>
          <ul>
            {echantillonsParType.year.map((echantillon, index) => (
              <li key={index}>
                {echantillon.sampleType}: {echantillon.count}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <strong>Statistiques sur les Analyses par Type: </strong>
          <ul>
            {analysesParType.year.map((analyse, index) => (
              <li key={index}>
                {analyse.analysisType}: {analyse.count}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2>Graphes</h2>
        <canvas id="demandesChart" ref={chartRef}></canvas>
      </section>

      <section>
        <h2>Status des Demandes</h2>
        <div>
          <strong>En attente de paiement: </strong>
          {statusDemandes.enAttenteDePaiement}
        </div>
        <div>
          <strong>En attente de validation bureau: </strong>
          {statusDemandes.enAttenteDeValidationBureau}
        </div>
        <div>
          <strong>En cours d'analyse: </strong>
          {statusDemandes.enCoursAnalyse}
        </div>
        <div>
          <strong>En attente de validation des résultats et génération de rapport: </strong>
          {statusDemandes.enAttenteDeValidationResultats}
        </div>
        <div>
          <strong>Finies: </strong>
          {statusDemandes.finies}
        </div>
      </section>
    </div>
  );
};

export default Department;
