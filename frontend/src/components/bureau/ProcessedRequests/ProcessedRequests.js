import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './ProcessedRequests.css';

// Fonction utilitaire pour capitaliser les mots
function capitalizeWords(text) {
    return text.replace(/\b\w/g, char => char.toUpperCase());
}
const ProcessedRequests = () => {
    const { department } = useParams(); // Obtenez le paramètre 'department' de l'URL
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        if (department) {
            fetch(`${apiBaseUrl}/instnapp/backend/routes/bureau/getProcessedRequests.php?department=${department}`)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Failed to load data');
                    }
                })
                .then(data => {
                    // Trier les demandes par ordre décroissant de clientReference
                    data.sort((a, b) => b.clientReference.localeCompare(a.clientReference));
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
                <h1>Les demandes analysées</h1>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Référence de la demande</th>
                            <th>Date de livraison</th>
                            <th>Description</th>
                            <th>Nombre d'analyses finis</th> {/* Nouvelle colonne */}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(request => {
                            const isRed = request.N1 < request.N2;
                            const descriptionLines = request.description.split('\n').map(line => capitalizeWords(line));
                            return (
                                <tr key={request.demande_id}>
                                    <td>{request.clientReference}</td>
                                    <td>{request.dilevery_delay}</td>
                                    <td>
                                       <div>
                                            {descriptionLines.slice(0, 1).join('\n')}
                                            {descriptionLines.length > 1 && (
                                                <div className="details">
                                                    {descriptionLines.slice(1).join('\n')}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`analyses-summary ${isRed ? 'red' : 'green'}`}>
                                            {request.analyses_summary}
                                        </span>
                                    </td>
                                    <td>
                                        <Link to={`/bureau/${department}/rapport/${request.demande_id}`} className="btn-primary">
                                            Générer le rapport {request.demande_id}
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProcessedRequests;
