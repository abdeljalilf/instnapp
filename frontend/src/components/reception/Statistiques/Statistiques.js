import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './Statistiques.css';
import moment from 'moment';
import 'moment/locale/fr'; // Import French locale

// Set the locale to French
moment.locale('fr');
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Statistiques = () => {
    const { department } = useParams(); // Ensure your route parameter matches
    const [data, setData] = useState({
        total_requests_3_months: 0,
        reports_generated_3_months: 0,
        reports_pending_3_months: 0,
        sample_statistics_3_months: [],
        analysis_statistics_3_months: [],
        total_requests_year: 0,
        reports_generated_year: 0,
        reports_pending_year: 0,
        sample_statistics_year: [],
        analysis_statistics_year: [],
        request_status: {},
        monthly_requests: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const session_id = localStorage.getItem('session_id');
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const [monthsToShow, setMonthsToShow] = useState(4); // Default to 4 months

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/instnapp/backend/routes/reception/INSTNDashboard.php`, {
                    params: { department },
                    headers: {
                        Authorization: session_id
                    }
                });
                setData(response.data || {});
                console.log('API Response:', response.data); // Ajouter ce log
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [department]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const handleMonthsChange = (event) => {
        setMonthsToShow(parseInt(event.target.value));
    };

    const getStatusColor = (status, count) => {
        if (status === 'completed' || status === 'pending_payment' || status === 'generated_report' ) return 'green';
        return 'white';
    };

    const statusContainers = [
        { label: 'Demandes finies', key: 'completed' },
        { label: 'Rapports Générés', key: 'generated_report' },
        { label: 'En attente de paiement', key: 'pending_payment' }
    ];

    const sampleData3Months = {
        labels: data.sample_statistics_3_months.map(stat => stat.sampleType),
        datasets: [
            {
                label: 'Quantité',
                data: data.sample_statistics_3_months.map(stat => stat.count),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }
        ]
    };

    const analysisData3Months = {
        labels: data.analysis_statistics_3_months.map(stat => stat.analysisType),
        datasets: [
            {
                label: 'Quantité',
                data: data.analysis_statistics_3_months.map(stat => stat.count),
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
            }
        ]
    };

    const sampleDataYear = {
        labels: data.sample_statistics_year.map(stat => stat.sampleType),
        datasets: [
            {
                label: 'Quantité',
                data: data.sample_statistics_year.map(stat => stat.count),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }
        ]
    };

    const analysisDataYear = {
        labels: data.analysis_statistics_year.map(stat => stat.analysisType),
        datasets: [
            {
                label: 'Quantité',
                data: data.analysis_statistics_year.map(stat => stat.count),
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
            }
        ]
    };

    const filteredMonthlyRequests = data.monthly_requests.slice(-monthsToShow);

    const monthlyRequestsData = {
        labels: filteredMonthlyRequests.map(req => moment(req.month, 'YYYY-MM').format('MMMM YYYY').toUpperCase()),
        datasets: [
            {
                label: 'Nombre de Demandes',
                data: filteredMonthlyRequests.map(req => req.total_requests),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.raw}`,
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    font: {
                        size: 14,
                    },
                },
                grid: {
                    display: false,
                },
            },
            y: {
                ticks: {
                    font: {
                        size: 12,
                    },
                },
                grid: {
                    display: true,
                },
            },
        },
    };

    return (
        <div className="departement-dashboard-container">
            <div className="departement-dashboard-title">
                <h1>Tableau de Bord Pour {department} </h1>
            </div>
            <div className="filter-container">
                <label htmlFor="department">Choisissez le département:</label>
                <select
                    id="department"
                    value={department}
                    onChange={(e) => window.location.href = `/reception/statistiques/${e.target.value}`}
                >
                    <option value="INSTN">INSTN</option>
                    <option value="TFXE">TFXE</option>
                    <option value="Hi">Hi</option>
                    <option value="ATN">ATN</option>
                </select>
            </div>
            <div className="dernier-mois-container">
               <div className="status-requests-title">
                    <h2>Statistiques du Dernier Mois pour {department}</h2>
                </div>
            <div className="status-container">    
                {statusContainers.map(({ label, key }) => {
                    const count = data.request_status[key] || 0;
                    return (
                        <div
                            key={key}
                            className="status-item"
                            style={{ backgroundColor: getStatusColor(key, count) }}
                        >
                            <div className="status-label">{label}</div>
                            <div className="status-count-container">
                                <div className="status-count">{count}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
            </div>

            {/* Three-Month Statistics */}
            <section className="stats-trim-section">
                <div className="monthly-requests-title">
                    <h2>Statistiques des 3 Derniers Mois pour {department}</h2>
                </div>
                <div className="stats-trim-summary">
                    <div className="stats-trim-summary-item">
                        <div className="request-count">
                            <h2>Nombre Demande Reçue</h2>
                        </div>
                        <div className="stats-trim-count">{data.total_requests_3_months}</div>
                    </div>
                    <div className="stats-trim-summary-item">
                        <div className="request-count">
                            <h2>Nombre Rapport Généré</h2>
                        </div>
                        <div className="stats-trim-count">{data.reports_generated_3_months}</div>
                    </div>
                </div>

                <div className="stats-trim-graphs">
                    <div className="chart-trim-container">
                        <h2>Échantillons par Type</h2>
                        <Bar data={sampleData3Months} options={chartOptions} />
                    </div>

                    <div className="chart-trim-container">
                        <h2>Analyses par Type</h2>
                        <Bar data={analysisData3Months} options={chartOptions} />
                    </div>
                </div>
            </section>

            {/* Annual Statistics */}
            <section className="stats-annuelle-section">
                <div className="monthly-requests-title">
                    <h2>Statistiques Annuelles pour {department}</h2>
                </div>
                <div className="stats-annuelle-summary">
                    <div className="stats-annuelle-summary-item">
                        <div className="request-count">
                            <h2>Nombre Demande Reçue</h2>
                        </div>
                        <div className="stats-annuelle-count">{data.total_requests_year}</div>
                    </div>
                    <div className="stats-annuelle-summary-item">
                        <div className="request-count">
                            <h2>Nombre Rapport Généré</h2>
                        </div>
                        <div className="stats-annuelle-count">{data.reports_generated_year}</div>
                    </div>
                </div>

                <div className="stats-annuelle-graphs">
                    <div className="chart-annuelle-container">
                        <h2>Échantillons par Type (Année)</h2>
                        <Bar data={sampleDataYear} options={chartOptions} />
                    </div>

                    <div className="chart-annuelle-container">
                        <h2>Analyses par Type (Année)</h2>
                        <Bar data={analysisDataYear} options={chartOptions} />
                    </div>
                </div>
            </section>

            <section className="monthly-request-section">
                <div className="monthly-requests-title">
                    <h2>Nombre des Demandes par Mois pour {department}</h2>
                </div>

                <div className="filter-container">
                    <label htmlFor="monthsToShow">Afficher les derniers:</label>
                    <select id="monthsToShow" value={monthsToShow} onChange={handleMonthsChange}>
                        <option value={4}>4 mois</option>
                        <option value={8}>8 mois</option>
                        <option value={12}>12 mois</option>
                        <option value={14}>14 mois</option>
                    </select>
                </div>

                <div className="chart-monthly-container">
                    <Bar data={monthlyRequestsData} options={chartOptions} />
                </div>
            </section>
        </div>
    );
};

export default Statistiques;
