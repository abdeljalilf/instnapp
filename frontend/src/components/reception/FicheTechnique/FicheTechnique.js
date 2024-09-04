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
    const ficheRefs = useRef([]);
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const session_id = localStorage.getItem('session_id');

    useEffect(() => {
        if (!clientId) {
            setError('Client ID manquant dans l\'URL');
            setLoading(false);
            return;
        }

        const fetchDetails = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/instnapp/backend/routes/reception/demandesDetails.php?referenceClient=${generateClientReference(clientId, year, month)}`, {
                    headers: {
                        Authorization: session_id
                    }
                });
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

    const generateClientReference = (clientId, year, month) => {
        const shortYear = year.toString().slice(-2);
        const formattedMonth = month.toString().padStart(2, '0');
        const formattedClientCount = clientId.toString().padStart(4, '0');
        return `DS${shortYear}${formattedMonth}/A${formattedClientCount}`;
    };

    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    const generatePDF = async () => {
        const pdf = new jsPDF('p', 'mm', 'a4'); // Initialize a new PDF document with A4 size in portrait orientation
        const scale = 1.5; // Define the scale for the canvas capture (higher scale means higher resolution)
    
        // Keep track of pages that have already been added to the PDF
        const addedPages = new Set();
    
        for (let i = 0; i < ficheRefs.current.length; i++) {
            const ref = ficheRefs.current[i];
    
            if (ref && ref instanceof HTMLElement) { // Check if the reference is a valid HTML element
                try {
                    // Convert the HTML element to a unique identifier (e.g., its innerHTML or any unique attribute)
                    const uniqueContent = ref.outerHTML;
    
                    // Check if this content has already been added to the PDF
                    if (!addedPages.has(uniqueContent)) {
                        const canvas = await html2canvas(ref, { scale: scale });
                        const imgData = canvas.toDataURL('image/png');
                        const imgProps = pdf.getImageProperties(imgData);
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
                        if (i > 0) {
                            pdf.addPage(); // Add a new page only if it's not the first element
                        }
    
                        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                        
                        // Mark this page as added to avoid duplication
                        addedPages.add(uniqueContent);
                    }
                } catch (error) {
                    console.error('Error generating canvas for ref:', ref, error);
                }
            } else {
                console.error('Invalid reference:', ref);
            }
        }
    
        // Save the final PDF after processing all the pages
        pdf.save(`fichetechnique_${generateClientReference(clientId, year, month)}.pdf`);
    };
    
    
    
    

    if (loading) return <div className="loader">Chargement...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div>
            <div className='submit-button-container-ft'>
                <button onClick={generatePDF} className="submit-button-ft">Télécharger en PDF</button>
            </div>
            
            {demandes && demandes.length > 0 ? (
                demandes.map((demande, demandeIndex) => {
                    const pages = [];
                    const samplesPerPage = 2;

                    for (let i = 0; i < demande.echantillons.length; i += samplesPerPage) {
                        const currentPageSamples = demande.echantillons.slice(i, i + samplesPerPage);
                        pages.push(
                            <div key={`${demandeIndex}-${i}`} className="form-group" ref={el => ficheRefs.current.push(el)}>
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
                                        <h2>FICHE TECHNIQUE DE SERVICE</h2>
                                    </div>
                                    <div className='form-header-ft'>
                                        <h3>Informations personnelles</h3>
                                    </div>
                                    <div className='info-perso'>
                                        <div className='info-perso-section-1'>
                                            <div className="form-group-ft">
                                                <label>Référence de la demande:</label>
                                                <p>{demande.clientReference}</p>
                                                <label>Nom:</label>
                                                <p>{demande.name}</p>
                                                <label>Adresse:</label>
                                                <p>{demande.address}</p>
                                            </div>
                                        </div>
                                        <div className='info-perso-section-1'>
                                            <div className="form-group-ft">
                                                <label>Téléphone:</label>
                                                <p>{demande.phone}</p>
                                                <label>Email:</label>
                                                <p>{demande.email}</p>
                                                <label>Date de la demande:</label>
                                                <p>{demande.requestingDate}</p>
                                            </div>
                                        </div>
                                        <div className='info-perso-section-1'>
                                            <div className="form-group-ft">
                                                <label>Apporté par:</label>
                                                <p>{demande.broughtBy}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-header-ft">
                                        <h3>Informations sur les échantillons</h3>
                                    </div>
                                    <div>
                                        {currentPageSamples.map((echantillon, echantillonIndex) => (
                                            <div key={`${i}-${echantillonIndex}`}>
                                                <div>
                                                    <h3>Echantillon {i + echantillonIndex + 1}:</h3>
                                                    <div className='info-perso'>
                                                            <div className='info-perso-section-1'>
                                                                <div className="form-group-ft">
                                                                    <label>Reference de l'échantillon:</label>
                                                                    <p>{echantillon.sampleReference}</p>
                                                                
                                                                    {echantillon.midacNumber && 
                                                                        <div>
                                                                            <label>Numéro MIDAC:</label>
                                                                            <p>{echantillon.midacNumber}</p>
                                                                        </div>
                                                                    }
                                                                    <label>Type d'échantillon:</label>
                                                                    <p>{echantillon.sampleType}</p>
                                                                </div>
                                                            </div>
                                                    
                                                    
                                                    <div className='info-perso-section-1'>
                                                        <div className="form-group-ft">
                                                            <label>Lieu de prélèvement:</label>
                                                            <p>{echantillon.samplingLocation}</p>
                                                            <label>Date de prélèvement:</label>
                                                            <p>{new Date(echantillon.samplingDate).toLocaleDateString()}</p>
                                                            <label>Prélevé par:</label>
                                                            <p>{echantillon.sampledBy}</p>
                                                        </div>
                                                        
                                                    </div>
                                                    
                                                    <div className='info-perso-section-1'>
                                                        <div className="form-group-ft">
                                                        <label>Quantite de l'echantillon:</label>
                                                        <p>{echantillon.sampleSize}</p>
                                                        {echantillon.quantiteDenree &&
                                                            <div>
                                                                <label>Quantite du denerée alimentaire:</label>
                                                            <p>{echantillon.quantiteDenree}</p>
                                                            </div>

                                                        }
                                                        <label>Observations:</label>
                                                        <p>{echantillon.sampleObservations}</p>
                                                        </div>
                                                    </div>

                                                    </div>
                                                    </div>
                                                    <label>Détails sur les analyses</label>
                                                    {echantillon.analyses.map((analyse, analyseIndex) => (
                                                        <div key={analyseIndex}>
                                                            <div className="form-group-ft">
                                                                <p> - Analyse {analyse.analysisType} de {analyse.parameter} par {analyse.technique} pour les éléments : {analyse.elementsDinteret.map(e => e.elementDinteret).join(', ')}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                        ))}
                                    </div>
                                    <div className='footer'>
                                        <div className="form-header-ft">
                                            <h3>Delais de livraison</h3>
                                        </div>
                                        <div className='info-perso'>
                                            <div className="form-group-ft">
                                                <label>Date de livraison:</label>
                                                <p>{demande.dilevery_delay}</p>
                                            </div>
                                        </div>
                                        <div className="form-header-ft">
                                            <h3>Signatures</h3>
                                        </div>
                                        <div className='signatures'>
                                            <p>Réceptionnaire,</p>
                                            <p>Signature du client,</p>
                                        </div>
                                        <div className='page-number'>
                                            <p>Page {i/2+1}/{Math.floor((demande.echantillons.length+1)/2)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return pages;
                })
            ) : (
                <p>Aucune demande trouvée.</p>
            )}
        </div>
    );
};

export default FicheTechnique;
