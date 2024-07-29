import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './FicheTechnique.css';
import instnlogo from '../../../images/INSTN-logo.png';

const FicheTechnique = () => {
    const { clientId } = useParams();
    const [demandes, setDemandes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const ficheRef = useRef();
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        if (!clientId) {
            setError('Client ID manquant dans l\'URL');
            setLoading(false);
            return;
        }

        const fetchDetails = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/instnapp/backend/routes/reception/demandesDetails.php?referenceClient=${generateClientReference(clientId)}`);
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

    const generatePDF = () => {
        const input = ficheRef.current;
        const scale = 1.5; // Augmentez cette valeur pour une meilleure qualité
        html2canvas(input, { scale: scale })
            .then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a3');
                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`fichetechnique_${generateClientReference(clientId)}.pdf`);
            })
            .catch(error => console.error('Erreur lors de la génération du PDF', error));
    };
    

    if (loading) return <div className="loader">Chargement...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div>
            <div ref={ficheRef}>
                {demandes && demandes.length > 0 ? (
                    demandes.map((demande, demandeIndex) => (
                        <div key={demandeIndex} className="form-group">
                            
                            <div className='container-ft'>
                                <div className='header-ft-elements'>
                                <div className='header-ft'>
                                    <div className='instn-logo'>
                                        <img src={instnlogo} alt="INSTN Logo" />
                                    </div>
                                    <h3>Ministère de l'Enseignement Supérieur et de la Recherche Scientifique</h3>
                                    <h3>INSTITUT NATIONAL DES SCIENCES ET TECHNIQUES NUCLEAIRES</h3>
                                    <h3>(INSTN-Madagascar)</h3>
                                    <h3>B.P.3907</h3>
                                    <h3>Tél: 0321179224</h3>
                                    <h3>E-mail : instn@moov.mg</h3>
                                </div>
                                </div>
                                <div className='title-ft'>
                                    <h1>FICHE TECHNIQUE DE SERVICE</h1>
                                </div>
                                <div className='form-header-ft'>
                                <h2>Informations personnelles</h2>
                                </div>
                                <div className='info-perso'>
                                <div className="form-group-ft">
                                    <label>Numero de reference:</label>
                                    <p>{demande.clientReference}</p>
                                </div>
                                <div className="form-group-ft">
                                    <label>Nom:</label>
                                    <p>{demande.name}</p>
                                </div>
                                <div className="form-group-ft">
                                    <label>Adresse:</label>
                                    <p>{demande.address}</p>
                                </div>
                                <div className="form-group-ft">
                                    <label>Téléphone:</label>
                                    <p>{demande.phone}</p>
                                </div>
                                <div className="form-group-ft">
                                    <label>Email:</label>
                                    <p>{demande.email}</p>
                                </div>
                                <div className="form-group-ft">
                                    <label>Date de la demande:</label>
                                    <p>{demande.requestingDate}</p>
                                </div>
                                </div>
                                <div className="form-header-ft">
                                            <h2>Informations sur les échantillons</h2>
                                </div>
                                {demande.echantillons.map((echantillon, echantillonIndex) => (
                                    <div key={echantillonIndex} className="sample-section">
                                        <div className='test'>
                                        <h3>Echantillon {echantillonIndex+1}:</h3>
                                        <div className="form-group-ft">
                                            <label> Reference de l'échantillon:</label>
                                            <p>{echantillon.sampleReference}</p>
                                        </div>
                                        <div className="form-group-ft">
                                            <label>Type d'échantillon:</label>
                                            <p>{echantillon.sampleType}</p>
                                        </div>
                                        <div className="form-group-ft">
                                            <label>Lieu de prélèvement:</label>
                                            <p>{echantillon.samplingLocation}</p>
                                        </div>
                                        <div className="form-group-ft">
                                            <label>Date de prélèvement:</label>
                                            <p>{new Date(echantillon.samplingDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="form-group-ft">
                                            <label>Prélevé par:</label>
                                            <p>{echantillon.sampledBy}</p>
                                        </div>
                                        <div className="form-group-ft">
                                            <label>Apporté par:</label>
                                            <p>{echantillon.broughtBy}</p>
                                        </div>
                                        <div className="form-group-ft">
                                            <label>Quantite de l'echantillon:</label>
                                            <p>{echantillon.sampleSize}</p>
                                        </div>
                                        <div className="form-group-ft">
                                            <label>Observations:</label>
                                            <p>{echantillon.sampleObservations}</p>
                                        </div>
                                        {echantillon.analyses.map((analyse, analyseIndex) => (
                                            <div key={analyseIndex} className="analysis-section">
                                                <div className="form-group-ft">
                                                    <label>Details sur l'analayse {analyseIndex+1}:</label>
                                                    <p>Analyse {analyse.analysisType} de {analyse.parameter} par {analyse.technique} pour les elements : {analyse.elementsDinteret.map(e => e.elementDinteret).join(', ')}</p>
                                                </div>
                                            </div>
                                        ))}
                                        </div>

                                    </div>
                                    
                                ))}
                                <div className="form-header-ft">
                                            <h2>Delais de livraison</h2>
                                </div>
                                <div className="form-group-ft">
                                            <label>Date de livraison:</label>
                                            <p>{demande.dilevery_delay}</p>
                                </div>
                                <div className="form-header-ft">
                                            <h2>Signatures</h2>
                                </div>
                                <div className='signatures'>
                                    <p>Réceptionnaire,</p>
                                    <p>Visa de la Direction,</p>
                                    <p>Signature du client,</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-details">Aucun détail disponible.</div>
                )}
            </div>
            <button onClick={generatePDF} className="generate-pdf-button">Télécharger en PDF</button>
        </div>
    );
};

export default FicheTechnique;
