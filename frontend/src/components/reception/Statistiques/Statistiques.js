import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './Statistiques.css';
import moment from 'moment';
import 'moment/locale/fr'; // Import French locale

// Set the locale to French
moment.locale('fr');
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Statistiques = () => {
    const [department, setDepartment] = useState('INSTN');
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
    const [monthsToShow, setMonthsToShow] = useState(4);

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
                console.log('Data received:', response.data);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [department]);

    const handleDepartmentChange = (event) => {
        setDepartment(event.target.value);
    };

    const handleMonthsChange = (event) => {
        setMonthsToShow(parseInt(event.target.value));
    };

    const getStatusColor = (status, count) => {
        if (status === 'completed' || status === 'pending_payment') return 'green';
        if (status === 'awaiting_result_validation' || status === 'pending_office_validation') {
            if (count < 4) return 'green';
            if (count >= 5 && count <= 8) return 'orange';
            return 'red';
        }
        if (status === 'in_analysis') return 'green';
        if (status === 'awaiting_result_review') return 'green';
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
        labels: (data.sample_statistics_3_months || []).map(stat => stat.sampleType),
        datasets: [
            {
                label: 'Quantité',
                data: (data.sample_statistics_3_months || []).map(stat => stat.count),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }
        ]
    };

    const analysisData3Months = {
        labels: (data.analysis_statistics_3_months || []).map(stat => stat.analysisType),
        datasets: [
            {
                label: 'Quantité',
                data: (data.analysis_statistics_3_months || []).map(stat => stat.count),
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
            }
        ]
    };

    const sampleDataYear = {
        labels: (data.sample_statistics_year || []).map(stat => stat.sampleType),
        datasets: [
            {
                label: 'Quantité',
                data: (data.sample_statistics_year || []).map(stat => stat.count),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }
        ]
    };

    const analysisDataYear = {
        labels: (data.analysis_statistics_year || []).map(stat => stat.analysisType),
        datasets: [
            {
                label: 'Quantité',
                data: (data.analysis_statistics_year || []).map(stat => stat.count),
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
            }
        ]
    };

    const filteredMonthlyRequests = (data.monthly_requests || []).slice(-monthsToShow);

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
                        size: 12,
                    },
                },
            },
            y: {
                ticks: {
                    font: {
                        size: 12,
                    },
                },
            },
        },
    };

    // Ensure request_status is defined and an object
    const requestStatus = data.request_status || {};

    return (
        <div>
            <h1>Dashboard Département</h1>
            <label htmlFor="department">Sélectionner un Département :</label>
            <select id="department" value={department} onChange={handleDepartmentChange}>
                <option value="INSTN">INSTN</option>
                <option value="TFXE">TFXE</option>
                <option value="ATN">ATN</option>
                <option value="Hi">Hi</option>
                {/* Ajoutez ici d'autres options pour les départements */}
            </select>
            <br />
            <label htmlFor="monthsToShow">Nombre de mois à afficher :</label>
            <select id="monthsToShow" value={monthsToShow} onChange={handleMonthsChange}>
                {[4, 6, 12].map(value => (
                    <option key={value} value={value}>{value} mois</option>
                ))}
            </select>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {!loading && !error && (
                <div>
                    <h2>Demandes et Rapports</h2>
                    <p>Total des demandes des 3 derniers mois : {data.total_requests_3_months}</p>
                    <p>Rapports générés : {data.reports_generated_3_months}</p>
                    <p>Rapports en attente : {data.reports_pending_3_months}</p>
                    <p>Total des demandes de l'année : {data.total_requests_year}</p>
                    <p>Rapports générés cette année : {data.reports_generated_year}</p>
                    <p>Rapports en attente cette année : {data.reports_pending_year}</p>
                    <div className="charts">
                        <div className="chart-container">
                            <h3>Statistiques des Échantillons (3 derniers mois)</h3>
                            <Bar data={sampleData3Months} options={chartOptions} />
                        </div>
                        <div className="chart-container">
                            <h3>Statistiques des Analyses (3 derniers mois)</h3>
                            <Bar data={analysisData3Months} options={chartOptions} />
                        </div>
                        <div className="chart-container">
                            <h3>Statistiques des Échantillons (Année)</h3>
                            <Bar data={sampleDataYear} options={chartOptions} />
                        </div>
                        <div className="chart-container">
                            <h3>Statistiques des Analyses (Année)</h3>
                            <Bar data={analysisDataYear} options={chartOptions} />
                        </div>
                        <div className="chart-container">
                            <h3>Demandes Mensuelles</h3>
                            <Bar data={monthlyRequestsData} options={chartOptions} />
                        </div>
                    </div>
                    <div className="status-container">
                        {statusContainers.map(status => (
                            <div key={status.key} style={{ color: getStatusColor(status.key, requestStatus[status.key] || 0) }}>
                                <p>{status.label}: {requestStatus[status.key] || 0}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Statistiques;
