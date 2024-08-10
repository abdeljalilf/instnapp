import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // Assure que tous les composants de Chart.js sont chargés

const Dashboard = ({ department }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const session_id = localStorage.getItem('session_id');
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/instnapp/backend/routes/bureau/dashboard.php`, {
                    params: { department }
                }, {
                    headers: {
                        Authorization: session_id
                    }
                });
                setData(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [department]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    // Assurez-vous que data et ses sous-propriétés sont définies
    const demandesParMois = data?.dataThreeMonths?.demandesParMois || [];
    const echantillonsTroisMois = data?.dataThreeMonths?.echantillons || [];
    const analysesTroisMois = data?.dataThreeMonths?.analyses || [];
    const echantillonsAnnee = data?.dataYear?.echantillons || [];
    const analysesAnnee = data?.dataYear?.analyses || [];
    
    const graphData = {
        labels: demandesParMois.map(item => item.month),
        datasets: [
            {
                label: 'Nombre de demandes par mois',
                data: demandesParMois.map(item => item.count),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }
        ]
    };

    // Données pour les statistiques
    const stats = {
        demandesTroisMois: data?.dataThreeMonths?.demandesTroisMois ?? 0,
        demandesAnnee: data?.dataYear?.demandesAnnee ?? 0,
        rapportsGeneresTroisMois: data?.dataThreeMonths?.rapportsGeneres ?? 0,
        rapportsGeneresAnnee: data?.dataYear?.rapportsGeneres ?? 0,
        rapportsAttenteTroisMois: data?.dataThreeMonths?.rapportsAttente ?? 0,
        enAttentePayement: data?.statistics?.enAttentePayement ?? 0,
        enAttenteValidationBureau: data?.statistics?.enAttenteValidationBureau ?? 0,
        enCoursAnalyse: data?.statistics?.enCoursAnalyse ?? 0,
        enAttenteValidationResultats: data?.statistics?.enAttenteValidationResultats ?? 0,
        finies: data?.statistics?.finies ?? 0
    };

    return (
        <div className="dashboard">
            <h1>Tableau de Bord - Département {department}</h1>

            <section>
                <h2>Sur les Trois Derniers Mois</h2>
                <p><strong>Nombre de Demandes Reçues :</strong> {stats.demandesTroisMois}</p>
                <p><strong>Nombre de Rapports Générés :</strong> {stats.rapportsGeneresTroisMois}</p>
                <p><strong>Nombre de Rapports en Attente :</strong> {stats.rapportsAttenteTroisMois}</p>
                <h3>Statistiques sur les Échantillons par Type</h3>
                <ul>
                    {echantillonsTroisMois.map((item, index) => (
                        <li key={index}>{item.sampleType}: {item.count}</li>
                    ))}
                </ul>
                <h3>Statistiques sur les Analyses par Type</h3>
                <ul>
                    {analysesTroisMois.map((item, index) => (
                        <li key={index}>{item.analysisType}: {item.count}</li>
                    ))}
                </ul>
            </section>

            <section>
                <h2>Sur l'Année</h2>
                <p><strong>Nombre de Demandes Reçues :</strong> {stats.demandesAnnee}</p>
                <p><strong>Nombre de Rapports Générés :</strong> {stats.rapportsGeneresAnnee}</p>
                <h3>Statistiques sur les Échantillons par Type</h3>
                <ul>
                    {echantillonsAnnee.map((item, index) => (
                        <li key={index}>{item.sampleType}: {item.count}</li>
                    ))}
                </ul>
                <h3>Statistiques sur les Analyses par Type</h3>
                <ul>
                    {analysesAnnee.map((item, index) => (
                        <li key={index}>{item.analysisType}: {item.count}</li>
                    ))}
                </ul>
            </section>

            <section>
                <h2>Graphique du Nombre de Demandes par Mois</h2>
                <Bar data={graphData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            </section>

            <section>
                <h2>Status des Demandes</h2>
                <ul>
                    <li><strong>En Attente de Paiement :</strong> {stats.enAttentePayement}</li>
                    <li><strong>En Attente de Validation Bureau :</strong> {stats.enAttenteValidationBureau}</li>
                    <li><strong>En Cours d'Analyse :</strong> {stats.enCoursAnalyse}</li>
                    <li><strong>En Attente de Validation des Résultats :</strong> {stats.enAttenteValidationResultats}</li>
                    <li><strong>Finies :</strong> {stats.finies}</li>
                </ul>
            </section>
        </div>
    );
};
export default Dashboard;