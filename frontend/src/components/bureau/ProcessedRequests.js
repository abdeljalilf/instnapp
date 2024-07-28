import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ProcessedRequests.css';

const ProcessedRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost:3000/backend/bureau/getProcessedRequests.php')
            .then(response => response.json())
            .then(data => {
                setRequests(data);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
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
                            <td>{request.delais_livraison}</td>
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
                                <Link to={`/bureau/rapport/${request.demande_id}`} className="btn-primary">
                                    Générer le rapport {request.demande_id}
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProcessedRequests;
