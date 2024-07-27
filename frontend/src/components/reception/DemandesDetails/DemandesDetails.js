import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DemandesDetails.css';

const DemandesDetails = () => {
    const { clientId } = useParams();
    const [demandes, setDemandes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!clientId) {
            setError('Client ID manquant dans l\'URL');
            setLoading(false);
            return;
        }

        const fetchDetails = async () => {
            try {
                const response = await axios.get(`http://localhost/instnapp/backend/routes/reception/demandesDetails.php?referenceClient=${generateClientReference(clientId)}`);
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
    }, [clientId]);

    const generateClientReference = (clientId) => {
        const year = new Date().getFullYear().toString().slice(-2);
        return `INSTN/DG/XRF/${year}/${clientId.toString().padStart(4, '0')}`;
    };

    if (loading) return <div className="loader">Chargement...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="container">
            <div className='form-header'>
            <h2>Détails de la Demande : {generateClientReference(clientId)}</h2>
            <Button color="inherit" onClick={() => navigate(`/reception/requests-details/fiche-technique/${clientId}`)} className="main-button">
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
                        </div>
                        <div className='container-details'>
                        {demande.echantillons.map((echantillon, echantillonIndex) => (
                            <div key={echantillonIndex} className="sample-section">
                                <div className="form-header-details">
                                    <h2>Informations sur l'échantillon {echantillonIndex + 1}</h2>
                                </div>
                                <h2>Informations sur l'échantillon {echantillonIndex + 1}</h2>
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
                                <div className="form-group">
                                    <label>Prélevé par:</label>
                                    <p>{echantillon.sampledBy}</p>
                                </div>
                                <div className="form-group">
                                    <label>Apporté par:</label>
                                    <p>{echantillon.broughtBy}</p>
                                </div>
                                <div className="form-group">
                                    <label>Quantite de l'echantillon:</label>
                                    <p>{echantillon.sampleSize}</p>
                                </div>
                                <div className="form-group">
                                    <label>Observations:</label>
                                    <p>{echantillon.sampleObservations}</p>
                                </div>
                                {echantillon.analyses.map((analyse, analyseIndex) => (
                                    <div key={analyseIndex} className="analysis-section">
                                        <div>
                                            <h3>Détails des analyses {analyseIndex + 1} sur l'échantillon {echantillonIndex + 1} </h3>
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
