import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './ProcessedRequests.css';

const ProcessedRequests = () => {
    const { department } = useParams(); // Obtenez le paramètre 'department' de l'URL
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        if (department) {
            fetch(`${apiBaseUrl}/instnapp/backend/routes/bureau/getProcessedRequests.php?department=${department}`)
                .then(response => response.json())
                .then(data => {
                    setRequests(data);
                    setLoading(false);
                })
                .catch(error => {
                    setError(error);
                    setLoading(false);
                });
        }
    }, [department]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className='processed-requests'>
            <div className="table-container">
                <h1>Processed Requests</h1>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Numéro de la demande</th>
                            <th>Date de livraison</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(request => (
                            <tr key={request.demande_id}>
                                <td>{request.demande_id}</td>
                                <td>{request.dilevery_delay}</td>
                                <td>
                                    <div>
                                        {request.description.split('\n').slice(0, 1).join('\n')}
                                        {request.description.split('\n').length > 1 && (
                                            <div className="details">
                                                {request.description.split('\n').slice(1).join('\n')}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <Link to={`/bureau/${department}/rapport/${request.demande_id}`} className="btn-primary">
                                        Générer le rapport {request.demande_id}
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProcessedRequests;