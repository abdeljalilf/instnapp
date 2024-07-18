// src/components/DemandeList/DemandesList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DemandesList.css';

const DemandesList = () => {
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchDemandes = async () => {
            try {
                const response = await axios.get('http://192.168.56.1/instnapp/backend/routes/demandelist.php');
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
            <div className="toolbar">
                <span className="breadcrumb">Liste des Demandes d'Analyses</span>
            </div>
            <div className="toolbar"> {/* Nouveau div pour le champ de recherche */}
                <label htmlFor="search" className="search-label">Rechercher :</label>
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
