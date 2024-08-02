import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // Required for Chart.js v3+
import './Statistiques.css'; // Assurez-vous de créer ce fichier CSS

const Statistiques = () => {
    const [processed, setProcessed] = useState([]);
    const [monthlyData, setMonthlyData] = useState(Array(12).fill(0));
    const [statistics, setStatistics] = useState({
        totalRequests: 0,
        validatedCount: 0,
        inProgressCount: 0
    });

    const currentYear = new Date().getFullYear();
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const session_id = localStorage.getItem('session_id');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/instnapp/backend/routes/reception/demandesList.php`, {
                    headers: {
                        Authorization: session_id
                    }
                });
                if (response.data.success && Array.isArray(response.data.demandes)) {
                    setProcessed(response.data.demandes);
                } else {
                    console.error('Invalid data structure:', response.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [apiBaseUrl, session_id]);

    useEffect(() => {
        if (!Array.isArray(processed)) {
            console.error('Processed data is not an array:', processed);
            return;
        }

        const monthlyCounts = Array(12).fill(0);
        let totalRequests = 0;
        let validatedCount = 0;
        let inProgressCount = 0;

        processed.forEach(demande => {
            if (demande.clientId) totalRequests++;

            demande.echantillons.forEach(echantillon => {
                echantillon.analyses.forEach(analysis => {
                    if (analysis.validated !== 'laboratory') inProgressCount++;
                    if (analysis.validated === 'laboratory') validatedCount++;
                });
            });

            if (demande.requestingDate) {
                const date = new Date(demande.requestingDate);
                if (!isNaN(date) && date.getFullYear() === currentYear) {
                    const month = date.getMonth();
                    monthlyCounts[month]++;
                }
            }
        });

        setMonthlyData(monthlyCounts);
        setStatistics({
            totalRequests,
            validatedCount,
            inProgressCount
        });
    }, [processed, currentYear]);

    const chartData = {
        labels: ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'],
        datasets: [
            {
                label: 'Demandes Traitées',
                data: monthlyData,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }
        ]
    };

    const chartOptions = {
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    return (
        <div>
            <div className="statistics-container">
                <div className="stat-card">
                    <div className="stat-number">{statistics.totalRequests}</div>
                    <div className="stat-description">Demandes Traitées</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{statistics.validatedCount}</div>
                    <div className="stat-description">Analyses Effectuées</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{statistics.inProgressCount}</div>
                    <div className="stat-description">Analyses en Cours</div>
                </div>
            </div>
            <div className="statistics-container">
                <div className="chart-container">
                    <Bar data={chartData} options={chartOptions} />
                </div>
            </div>
        </div>
    );
};

export default Statistiques;
