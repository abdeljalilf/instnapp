import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Archive.css';

// Fonction pour capitaliser la première lettre
const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const Archive = () => {
    const { department } = useParams(); // Get the department from the URL
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]); // État pour les demandes filtrées
    const [loading, setLoading] = useState(true); // État de chargement initial
    const [error, setError] = useState(null); // État pour gérer les erreurs
    const [searchTerm, setSearchTerm] = useState(""); // État pour le terme de recherche
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const session_id = localStorage.getItem('session_id');

    useEffect(() => {
        if (department) {
            fetch(`${apiBaseUrl}/instnapp/backend/routes/bureau/Archive.php?department=${department}`, {
                headers: {
                    Authorization: session_id
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Fetched data:', data);
                    // Trier les demandes par ordre décroissant de clientReference
                    data.sort((a, b) => b.clientReference.localeCompare(a.clientReference));
                    setRequests(data);
                    setFilteredRequests(data); // Initialement, les demandes filtrées sont toutes les demandes
                    setLoading(false); // Mettre à jour l'état de chargement
                })
                .catch(error => {
                    console.error('Error:', error);
                    setError('Erreur lors du chargement des demandes.'); // Message d'erreur
                    setLoading(false); // Gérer l'état de chargement en cas d'erreur
                });
        }
    }, [department]); // Fetch data whenever the department changes

    const handleSearch = (event) => {
        const term = event.target.value;
        setSearchTerm(term);
        if (term) {
            // Filtrer les demandes par clientReference
            const filtered = requests.filter(request => request.clientReference.includes(term));
            setFilteredRequests(filtered);
        } else {
            setFilteredRequests(requests); // Réinitialiser les demandes filtrées si la recherche est vide
        }
    };

    if (loading) {
        return <div>Loading...</div>; // Afficher un message de chargement si les données ne sont pas encore chargées
    }

    if (error) {
        return <div>{error}</div>; // Afficher le message d'erreur
    }

    return (
        <div className="table-container">
            <h2>Historiques des demandes</h2>
            {/* Ajouter la case de recherche */}
            <input 
                type="text"
                placeholder="Rechercher par Numéro de la demande"
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
            />
            <table className="table">
                <thead>
                    <tr>
                        <th>Référence de la demande</th>
                        <th>Date de livraison</th>
                        <th>Description</th>
                        <th>Statut</th> {/* Ajout de la colonne de statut */}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredRequests.map((request) => (
                        <tr key={request.demande_id}>
                            <td>{request.clientReference}</td>
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
                                <span style={{ color: request.status === 'Pas encore validée' ? 'red' : 'green' }}>
                                    {request.status}
                                </span>
                            </td>
                            <td>
                                <Link 
                                    to={`/bureau/${department}/${request.status === 'Validée' ? 'GenerateRapport' : 'rapportfinal'}/${request.demande_id}`} 
                                    className="btn-primary"
                                >
                                    Générer le Rapport
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Archive;
