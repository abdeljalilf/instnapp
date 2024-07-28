import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './FinanceDemandesList.css';

const FinanceDemandesList = () => {
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    const fetchDemandes = async () => {
        try {
            const response = await axios.get('http://localhost/instnapp/backend/routes/finance/financeDemandesList.php');
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
                        <th>Service demande</th>
                        <th>Details</th>
                        {/* <th>Payement</th> */}
                    </tr>
                </thead>
                <tbody>
                    {filteredDemandes.map((demande) => (
                        <tr key={demande.clientId}>
                            <td>{demande.clientReference}</td>
                            <td>
                                {demande.echantillons.map((echantillon) => (
                                    <div key={echantillon.echantillonId} className='sample'>
                                        {/* Reference de l'echantillon: {echantillon.sampleReference} <br /> */}
                                        {echantillon.analyses.map((analyse) => (
                                            <div key={analyse.analysisId} className='analysis'>
                                                Analyse  {analyse.analysisType} de {analyse.parameter} par {analyse.technique} pour
                                                les eléments: {analyse.elementsDinteret.map(e => e.elementDinteret).join(', ')}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </td>
                            <td>
                                <Link to={`/finance/DetailesDemandes/${demande.clientId}`}>
                                    <button className="details-button">Voir les détails</button>
                                </Link>
                            </td>
                            {/* <td>
                                <button
                                    className="validate-button"
                                    onClick={() => handleValidatePayment(demande.clientId, demande.clientReference)}
                                >
                                    Valider le paiement
                                </button>
                            </td> */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FinanceDemandesList;
