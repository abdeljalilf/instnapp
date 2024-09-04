import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import axios from 'axios';
import './FinanceDemandesDetails.css';

const FinanceDemandesDetails = () => {
    const { clientId } = useParams();
    const [demandes, setDemandes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const session_id = localStorage.getItem('session_id');

    // Define year and month here
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    // Define the generateClientReference function before it is used
    const generateClientReference = (clientId, year, month) => {
        const shortYear = year.toString().slice(-2);
        const formattedMonth = month.toString().padStart(2, '0');
        const formattedClientCount = clientId.toString().padStart(4, '0');
        return `DS${shortYear}${formattedMonth}_A${formattedClientCount}`;
    };

    useEffect(() => {
        if (!clientId) {
            setError("Client ID manquant dans l'URL");
            setLoading(false);
            return;
        }

        const fetchDetails = async () => {
            try {
                const referenceClient = generateClientReference(clientId, year, month);
                const response = await axios.get(
                    `${apiBaseUrl}/instnapp/backend/routes/finance/financeDemandesDetails.php?referenceClient=${referenceClient}`, 
                    {
                        headers: {
                            Authorization: session_id
                        }
                    }
                );
                if (response.data.success) {
                    setDemandes(response.data.demandes);
                } else {
                    setError('Aucun détail trouvé pour cette demande.');
                }
            } catch (error) {
                setError('Erreur lors de la récupération des détails de la demande');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [clientId, apiBaseUrl, session_id, year, month]);

    const handleValidateDemande = async () => {
        try {
            const response = await axios.post(
                `${apiBaseUrl}/instnapp/backend/routes/finance/financeDemandesList.php`,
                {
                    clientId: clientId,
                    newValidatedValue: 'finance'
                },
                {
                    headers: {
                        Authorization: session_id
                    }
                }
            );

            if (response.data.success) {
                alert(`Le la demande de référence ${generateClientReference(clientId, year, month)} a été validée.`);
                navigate('/finance/NouvellesDemandes'); // Redirect after successful validation
            } else {
                alert('Échec de la mise à jour de validated.');
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour de validated:', error);
            alert('Erreur lors de la mise à jour de validated.');
        }
    };

    if (loading) return <div className="loader">Chargement...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="container">
            <div className='form-header-details'>
                <h2>Détails de la Demande : {generateClientReference(clientId, year, month)}</h2>
            </div>
            {demandes && demandes.length > 0 ? (
                demandes.map((demande, demandeIndex) => (
                    <div key={demandeIndex} className="form-group">
                        <div className='container-details'>
                            {demande.echantillons.map((echantillon, echantillonIndex) => (
                                <div key={echantillonIndex} className="sample-section">
                                    {echantillon.analyses.map((analyse, analyseIndex) => (
                                        <div key={analyseIndex} className="analysis-section">
                                            <div className='form-header-details'>
                                                <h3>Détails des analyses {analyseIndex + 1} sur l'échantillon {echantillonIndex + 1} </h3>
                                            </div>
                                            <div className='container-finance'>
                                                <div className="form-group">
                                                    <label>Type d'analyse:</label>
                                                    <p>{analyse.analysisType}</p>
                                                </div>
                                                <div className="form-group">
                                                    <label>Paramètre:</label>
                                                    <p>{analyse.parameter}</p>
                                                </div>
                                                <div className="form-group">
                                                    <label>Éléments d'intérêt:</label>
                                                    <p>{analyse.elementsDinteret.map(e => e.elementDinteret).join(', ')}</p>
                                                </div>
                                                <div className="form-group">
                                                    <label>Technique:</label>
                                                    <p>{analyse.technique}</p>
                                                </div>
                                                {echantillon.quantiteDenree &&
                                                            <div>
                                                                <label>Quantite du denerée alimentaire:</label>
                                                            <p>{echantillon.quantiteDenree}</p>
                                                            </div>

                                                        }
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className="validate-button-container">
                            <Button
                                onClick={handleValidateDemande}
                                className="validate-finance"
                            >
                                Valider la demande
                            </Button>
                        </div>
                        
                    </div>
                ))
            ) : (
                <div className="no-details">Aucun détail disponible.</div>
            )}
        </div>
    );
};

export default FinanceDemandesDetails;
