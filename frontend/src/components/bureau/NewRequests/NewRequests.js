import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './NewRequests.css';

// Fonction pour capitaliser la première lettre
const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const NewRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true); // État de chargement initial
    const [error, setError] = useState(null); // État pour gérer les erreurs
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        fetch(`${apiBaseUrl}/instnapp/backend/routes/bureau/getNewRequests.php`)
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
                setError('Erreur lors du chargement des demandes.'); // Message d'erreur
                setLoading(false); // Gérer l'état de chargement en cas d'erreur
            });
    }, []);

    if (loading) {
        return <div>Loading...</div>; // Afficher un message de chargement si les données ne sont pas encore chargées
    }

    if (error) {
        return <div>{error}</div>; // Afficher le message d'erreur
    }

    return (
        <div className="table-container">
            <h2>Les nouvelles demandes à valider</h2>
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
                    {requests.map((request) => (
                        <tr key={request.demande_id}>
                            <td>{request.demande_id}</td>
                            <td>{request.dilevery_delay}</td>
                            <td>
                                {Object.keys(request.samples).map((sampleType, index) => (
                                    <div key={index}>
                                        <strong>{capitalizeFirstLetter(sampleType)} :</strong> 
                                        {request.samples[sampleType].map(item => `Analyse ${item}`).join(', ')}
                                    </div>
                                ))}
                            </td>
                            <td>
                                <Link to={`/bureau/request/${request.demande_id}`} className="btn-primary">
                                    Afficher plus
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default NewRequests;
