// src/components/DemandeList/Status_demandes.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Status_demandes.css';

const Status_demandes = () => {
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const session_id = localStorage.getItem('session_id');

    useEffect(() => {
        const fetchDemandes = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/instnapp/backend/routes/reception/Status_demandes.php`, {
                    headers: {
                        Authorization: session_id
                    }
                });
                console.log(response.data); // Déboguer ici
                if (response.data.success) {
                    setDemandes(response.data.demandes);
                } else {
                    setError(response.data.message); // Afficher le message d'erreur détaillé
                }
            } catch (error) {
                setError('Erreur lors de la récupération des demandes');
            } finally {
                setLoading(false);
            }
        };
    
        fetchDemandes();
    }, []);
    

    const filteredDemandes = demandes.filter(demande =>
        demande.clientReference?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="loader">Chargement...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="reception-form">
            <div className="demandes-form-header">
                <p>Liste des Demandes d'Analyses</p>
            </div>
            <div className="toolbar">
                <label htmlFor="search" className="search-label">Rechercher :</label>
                <br />
                <input
                    type="text"
                    id="search"
                    placeholder="Entrez votre recherche..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />
            </div>
            <table className="styled-table">
                <thead className='tablehead'>
                    <tr>
                        <th>Reference de la demande</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDemandes.map((demande) => (
                        <tr key={demande.clientId}>
                            <td>{demande.clientReference}</td>
                            <td>
                                {Object.keys(demande.departments).map((departement, index) => (
                                    <div key={index}>
                                        <strong>{departement} :</strong> {demande.departments[departement].validated_status}
                                    </div>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Status_demandes;
