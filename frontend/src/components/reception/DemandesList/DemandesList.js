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
                        <th>Reference Client</th>
                        <th>Service</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDemandes.map((demande) => {
                        // Combiner tous les échantillons et analyses en une seule chaîne de texte
                        const serviceDetails = demande.echantillons.map((echantillon) =>
                            echantillon.analyses.map((analyse) =>
                                <>
                                    Analyse {analyse.analysisType} de {analyse.parameter} par {analyse.technique} (Éléments d'intérêt: {analyse.elementsDinteret.map(e => e.elementDinteret).join(', ')})
                                    <br />
                                </>
                            )
                        );
                        

                        return (
                            <tr key={demande.clientId}>
                                <td>{demande.clientReference}</td>
                                <td>{serviceDetails}</td>
                                <td>
                                    <Link to={`/reception/DemandesList/fiche-technique/${demande.clientId}`}>
                                        <button className="details-button">Voir les détails</button>
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default DemandesList;