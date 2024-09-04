import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './FinanceDemandesList.css';

const FinanceDemandesList = () => {
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const session_id = localStorage.getItem('session_id');

    const fetchDemandes = async () => {
        try {
            const response = await axios.get(`${apiBaseUrl}/instnapp/backend/routes/finance/financeDemandesList.php`, {
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

    useEffect(() => {
        fetchDemandes();
    }, []);

    // const handleValidatePayment = async (clientId, clientReference) => {
    //     try {
    //         const response = await axios.post('http://localhost/instnapp/backend/routes/finance/financeDemandesList.php', {
    //             clientId: clientId,
    //             newValidatedValue: 'finance'
    //         });

    //         if (response.data.success) {
    //             alert(`Le paiement de la demande de référence a été effectué.`);
    //             // Rafraîchir les données après la mise à jour
    //             fetchDemandes();
    //         } else {
    //             alert('Échec de la mise à jour de validated.');
    //         }
    //     } catch (error) {
    //         console.error('Erreur lors de la mise à jour de validated:', error);
    //         alert('Erreur lors de la mise à jour de validated.');
    //     }
    // };

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
                                    <Link to={`/finance/DetailesDemandes/${demande.clientId}`}>
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

export default FinanceDemandesList;
