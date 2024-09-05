// src/components/DemandeList/Status_demandes.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Status_demandes.css';

const Status_demandes = () => {
    const [demandes, setDemandes] = useState([]);
    const [filteredDemandes, setFilteredDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingId, setUpdatingId] = useState(null); // ID de la demande en cours de mise à jour
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
                if (response.data.success) {
                    setDemandes(response.data.demandes);
                    setFilteredDemandes(response.data.demandes);
                } else {
                    setError(response.data.message);
                }
            } catch (error) {
                setError('Erreur lors de la récupération des demandes');
            } finally {
                setLoading(false);
            }
        };

        fetchDemandes();
    }, [apiBaseUrl, session_id]);

    const handleUpdateStatus = async (clientId, departement) => {
        console.log('Client ID:', clientId);
        console.log('Département:', departement);
        setUpdatingId(clientId); // Marquer la demande comme en cours de mise à jour
        try {
            const response = await axios.post(`${apiBaseUrl}/instnapp/backend/routes/reception/Update_status_final.php`, {
                clientId,
                departement,
                newStatus: 'reception_step_2'
            }, {
                headers: {
                    Authorization: session_id
                }
            });
            console.log('Réponse du serveur:', response.data);
            // Mettre à jour les données dans l'état local
            setDemandes(prevDemandes => {
                return prevDemandes.map(demande => {
                    if (demande.clientId === clientId) {
                        // Mettez à jour le statut du département spécifique
                        const updatedDepartments = { ...demande.departments };
                        updatedDepartments[departement].validated_status = 'Rapport livré';
                        return { ...demande, departments: updatedDepartments };
                    }
                    return demande;
                });
            });
            handleSearch({ target: { value: searchTerm } }); // Re-filter after update
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            setError('Erreur lors de la mise à jour du statut');
        } finally {
            setUpdatingId(null); // Réinitialiser l'état de mise à jour
        }
    };

    const handleSearch = (event) => {
        const term = event.target.value.trim().toLowerCase();
        setSearchTerm(term);

        if (term) {
            const filtered = demandes.filter(demande => {
                return (
                    demande.clientReference.toLowerCase().includes(term) ||
                    demande.name.toLowerCase().includes(term) ||
                    demande.dilevery_delay.toLowerCase().includes(term) 
                );
            });
            setFilteredDemandes(filtered);
        } else {
            setFilteredDemandes(demandes); // Réinitialiser les demandes filtrées si la recherche est vide
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'paiment validé':
                return 'status-payment-validated';
            case 'En cours d\'analyse':
                return 'status-in-progress';
            case 'En cours de génération du rapport':
                return 'status-report-generation';
            case 'Rapport généré':
                return 'status-report-generated';
            case 'Rapport livré':
                return 'status-report-delivered';
            default:
                return 'status-awaiting-validation';
        }
    };

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
                    value={searchTerm}
                    onChange={handleSearch}
                    className="search-input"
                />
            </div>
            <table className="styled-table">
                <thead className='tablehead'>
                    <tr>
                        <th>Référence</th>
                        <th>Données du client</th>
                        <th>Status</th>
                        <th>Date de livraison</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDemandes.map((demande) => (
                        <tr key={demande.clientId}>
                            <td>{demande.clientReference}</td>
                            <td>
                                <div><strong>Client :</strong> {demande.name}</div>
                                <div><strong>Telephone :</strong> {demande.phone}</div>
                                <div><strong>Email :</strong> {demande.email}</div>
                            </td>
                            <td>
                                {Object.keys(demande.departments).map((departement, index) => {
                                    const status = demande.departments[departement].validated_status;
                                    const statusClass = getStatusClass(status);
                                    return (
                                        <div key={index} className={statusClass}>
                                            <strong>{departement} :</strong> {status}
                                        </div>
                                    );
                                })}
                            </td>
                            <td>{demande.dilevery_delay}</td>
                            <td>
                                {Object.keys(demande.departments).map((departement, index) => {
                                    const status = demande.departments[departement].validated_status;
                                    return status === 'Rapport généré' ? (
                                        <button
                                            key={index}
                                            onClick={() => handleUpdateStatus(demande.clientId, departement)}
                                            className='livre-button'
                                            disabled={updatingId === demande.clientId} // Désactiver le bouton pendant la mise à jour
                                        >
                                            {updatingId === demande.clientId ? 'Livraison en cours...' : `Livrer les rapports ${departement}`}
                                        </button>
                                    ) : null;
                                })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Status_demandes;
