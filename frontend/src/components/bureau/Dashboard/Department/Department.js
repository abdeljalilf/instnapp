import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './Department.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DepartmentDashboard = () => {
    const { department } = useParams();
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
        request_status: {}
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const session_id = localStorage.getItem('session_id');
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/instnapp/backend/routes/bureau/dashboard.php`, {
                    params: { department },
                    headers: {
                        Authorization: session_id
                    }
                });
                setData(response.data || {});
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

    const getStatusColor = (status, count) => {
        if (status === 'completed' || status === 'pending_payment') return 'green';
        if (status === 'awaiting_result_validation' || status === 'pending_office_validation') {
            if (count < 4) return 'green';
            if (count >= 5 && count <= 8) return 'orange';
            return 'red';
        }
        if (status === 'in_analysis') return 'blue';
        if (status === 'awaiting_result_review') return 'gray';
        return 'white';
    };

    const statusContainers = [
        { label: 'Demandes finies', key: 'completed' },
        { label: 'En attente de paiement', key: 'pending_payment' },
        { label: 'Rapports en attente', key: 'awaiting_result_validation' },
        { label: 'En attente Validation bureau', key: 'pending_office_validation' },
        { label: 'En cours d\'analyse', key: 'in_analysis' },
        { label: 'En cours de révision', key: 'awaiting_result_review' }
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

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context) => `Quantité: ${context.raw}`,
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    font: {
                        size: 10,
                    },
                },
                grid: {
                    display: false,
                },
            },
            y: {
                ticks: {
                    font: {
                        size: 10,
                    },
                },
                grid: {
                    display: true,
                },
            },
        },
    };

    return (
        <div>
            <h1>Dashboard for {department} Department</h1>

            {/* Request Status Breakdown */}
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

            {/* Three-Month Statistics */}
            <section className="stats-section">
                <h1>Statistiques Derniers 3 mois</h1>
                
                <div className="stats-summary">
                    <div className="stats-summary-item">
                        <h2>Nombre Demande Reçue (Derniers 3 mois)</h2>
                        <div className="stats-count">{data.total_requests_3_months}</div>
                    </div>
                    <div className="stats-summary-item">
                        <h2>Nombre Rapport Généré (Derniers 3 mois)</h2>
                        <div className="stats-count">{data.reports_generated_3_months}</div>
                    </div>
                </div>
                
                <div className="stats-graphs">
                    <div className="chart-container-small">
                        <h2>Échantillons par Type</h2>
                        <Bar data={sampleData3Months} options={chartOptions} />
                    </div>

                    <div className="chart-container-small">
                        <h2>Analyses par Type</h2>
                        <Bar data={analysisData3Months} options={chartOptions} />
                    </div>
                </div>
            </section>

            {/* Annual Statistics */}
            <section className="stats-annuelle-section">
                <h1>Statistiques Annuelles</h1>
                
                <div className="stats-annuelle-summary">
                    <div className="stats-annuelle-summary-item">
                        <h2>Nombre Demande Reçue (Année)</h2>
                        <div className="stats-annuelle-count">{data.total_requests_year}</div>
                    </div>
                    <div className="stats-annuelle-summary-item">
                        <h2>Nombre Rapport Généré (Année)</h2>
                        <div className="stats-annuelle-count">{data.reports_generated_year}</div>
                    </div>
                </div>
                
                <div className="stats-annuelle-graphs">
                    <div className="chart-container-small">
                        <h2>Échantillons par Type (Année)</h2>
                        <Bar data={sampleDataYear} options={chartOptions} />
                    </div>

                    <div className="chart-container-small">
                        <h2>Analyses par Type (Année)</h2>
                        <Bar data={analysisDataYear} options={chartOptions} />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DepartmentDashboard;
