// NewRequests.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './NewRequests.css';

const NewRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true); // État de chargement initial

    useEffect(() => {
        fetch('http://localhost:3000/backend/bureau/getNewRequests.php')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Fetched data:', data);
                setRequests(data);
                setLoading(false); // Mettre à jour l'état de chargement
            })
            .catch(error => {
                console.error('Error:', error);
                setLoading(false); // Gérer l'état de chargement en cas d'erreur
            });
    }, []);

    if (loading) {
        return <div>Loading...</div>; // Afficher un message de chargement si les données ne sont pas encore chargées
    }

    return (
        <div className="table-container">
            <h2>Les nouvelles demandes à valider</h2>
            <table className="table">
                <thead>
                    <tr>
                        <th>Numéro de la commande</th>
                        <th>Date de livraison</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((request, index) => (
                        <tr key={`${request.demande_id}-${index}`}>
                            <td>{request.demande_id}</td>
                            <td>{request.delais_livraison}</td>
                            <td>{`Analyse ${request.analysisType} pour ${request.sampleType}`}</td>
                            <td>
                            <Link to={`/bureau/request/${request.demande_id}`} className="btn-primary">Afficher plus</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default NewRequests;
