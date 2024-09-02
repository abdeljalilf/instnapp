import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import axios from 'axios';
import './DemandesDetails.css';

const DemandesDetails = () => {
    const { clientId } = useParams();
    const [demandes, setDemandes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const session_id = localStorage.getItem('session_id');

    const generateClientReference = (clientId, year, month) => {
        const shortYear = year.toString().slice(-2);
        const formattedMonth = month.toString().padStart(2, '0');
        const formattedClientCount = clientId.toString().padStart(4, '0');
        return `DS${shortYear}${formattedMonth}-A${formattedClientCount}`;
    };

    useEffect(() => {
        if (!clientId) {
            setError('Client ID manquant dans l\'URL');
            setLoading(false);
            return;
        }

        const fetchDetails = async () => {
            const year = new Date().getFullYear();
            const month = new Date().getMonth() + 1;
            const referenceClient = generateClientReference(clientId, year, month);

            try {
                const response = await axios.get(
                    `${apiBaseUrl}/instnapp/backend/routes/reception/demandesDetails.php?referenceClient=${referenceClient}`,
                    {
                        headers: { Authorization: session_id }
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
    }, [clientId, apiBaseUrl, session_id]);

    if (loading) return <div className="loader">Chargement...</div>;
    if (error) return <div className="error">{error}</div>;

    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    return (
        <div className="container">
            <div className='form-header'>
                <h2>Détails de la Demande : {generateClientReference(clientId, year, month)}</h2>
                <Button color="inherit" onClick={() => navigate(`/reception/DemandesList/fiche-technique/${clientId}`)} className="main-button">
                    Fiche technique
                </Button>
            </div>
            {demandes && demandes.length > 0 ? (
                demandes.map((demande, demandeIndex) => (
                    <div key={demandeIndex} className="form-group">
                        <div className='container-details'>
                            <div className='form-header-details'>
                                <h2>Informations personnelles</h2>
                            </div>

                            {demande.cleClient && (
                                <div className="form-group">
                                <label>Référence du client:</label>
                                <p>{demande.cleClient}</p>
                            </div>
                             )}
                            <div className="form-group">
                                <label>Nom:</label>
                                <p>{demande.name}</p>
                            </div>
                            <div className="form-group">
                                <label>Adresse:</label>
                                <p>{demande.address}</p>
                            </div>
                            <div className="form-group">
                                <label>Téléphone:</label>
                                <p>{demande.phone}</p>
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <p>{demande.email}</p>
                            </div>
                            <div className="form-group">
                                <label>Date de la demande:</label>
                                <p>{demande.requestingDate}</p>
                            </div>
                            <div className="form-group">
                                <label>Date de la livraison:</label>
                                <p>{demande.dilevery_delay}</p>
                            </div>
                            <div className="form-group">
                                <label>Apporté par:</label>
                                <p>{demande.broughtBy}</p>
                            </div>
                        </div>
                        <div className='container-details'>
                            {demande.echantillons.map((echantillon, echantillonIndex) => (
                                <div key={echantillonIndex} className="sample-section">
                                    <div className="form-header-details">
                                        <h2>Informations sur l'échantillon {echantillonIndex + 1}</h2>
                                    </div>
                                    <div className="form-group">
                                        <label>Code de l'échantillon:</label>
                                        <p>{echantillon.sampleReference}</p>
                                    </div>
                                    {echantillon.midacNumber && (
                                        <div className="form-group">
                                            <label>Numéro MIDAC:</label>
                                            <p>{echantillon.midacNumber}</p>
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label>Type d'échantillon:</label>
                                        <p>{echantillon.sampleType}</p>
                                    </div>
                                    <div className="form-group">
                                        <label>Lieu de prélèvement:</label>
                                        <p>{echantillon.samplingLocation}</p>
                                    </div>
                                    <div className="form-group">
                                        <label>Date de prélèvement:</label>
                                        <p>{new Date(echantillon.samplingDate).toLocaleDateString()}</p>
                                    </div>
                                    {echantillon.samplingTime && echantillon.sampleType === 'eau' && (
                                        <div className="form-group">
                                            <label>Temps de prélèvement:</label>
                                            <p>{echantillon.samplingTime}</p>
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label>Quantité de l'échantillon:</label>
                                        <p>{echantillon.sampleSize}</p>
                                    </div>
                                    {echantillon.quantiteDenree &&  (
                                        <div className="form-group">
                                            <label>Quantité du denrée alimentaire:</label>
                                            <p>{echantillon.quantiteDenree}</p>
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label>Observations:</label>
                                        <p>{echantillon.sampleObservations}</p>
                                    </div>
                                    {echantillon.analyses.map((analyse, analyseIndex) => (
                                        <div key={analyseIndex} className="analysis-section">
                                            <div>
                                                <h3>Détails des analyses {analyseIndex + 1} sur l'échantillon {echantillonIndex + 1}</h3>
                                            </div>
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
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <div className="no-details">Aucun détail disponible.</div>
            )}
        </div>
    );
};

export default DemandesDetails;
