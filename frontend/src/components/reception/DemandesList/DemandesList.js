// src/components/DemandeList/DemandesList.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './DemandesList.css';

const DemandesList = () => {
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const session_id = localStorage.getItem('session_id');
    useEffect(() => {
        const fetchDemandes = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/instnapp/backend/routes/reception/demandesList.php`, {
                    headers: {
                        Authorization: session_id
                    }
                });
                if (response.data.success) {
                    setDemandes(response.data.demandes);
                } else {
                    setError('Aucune demande trouvée.');
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
        <div className="demandes-container">
            <div className="form-header">
                <h2>Liste des Demandes d'Analyses</h2>
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
                        <th>Reference Client</th>
                        <th>Service</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDemandes.map((demande) =>
                        demande.echantillons.map((echantillon) =>
                            echantillon.analyses.map((analyse) => (
                                <tr key={analyse.analysisId}>
                                    <td>{demande.clientReference}</td>
                                    <td>
                                        Analyse {analyse.analysisType} de {analyse.parameter} par {analyse.technique} <br />
                                        Éléments d'intérêt: {analyse.elementsDinteret.map(e => e.elementDinteret).join(', ')}
                                    </td>
                                    <td>
                                        <Link to={`/reception/DemandesList/${demande.clientId}`}>
                                            <button className="details-button">Voir les détails</button>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DemandesList;
