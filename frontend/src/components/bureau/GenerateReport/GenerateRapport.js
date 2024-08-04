import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './GenerateRapport.css';
import html2pdf from 'html2pdf.js';
import jsPDF from 'jspdf';

const GenirateRapport = () => {
    const { id, department } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        if (id && department) {
            fetch(`${apiBaseUrl}/instnapp/backend/routes/bureau/GenerateReport.php?demande_id=${id}&department=${department}`)
                .then((response) => response.text())
                .then((text) => {
                    try {
                        const data = JSON.parse(text);
                        if (data.error) {
                            setError(data.error);
                        } else {
                            setData(data.reports[0]);
                        }
                    } catch (error) {
                        setError('Failed to parse JSON');
                    }
                })
                .catch((error) => {
                    setError(error.message);
                });
        } else {
            setError('Invalid demande_id provided');
        }
    }, [id, department]);

    const handleDownload = () => {
        const element = document.getElementById('report-container');
        const opt = {
            margin: [35, 10], // 35mm pour le haut et le bas, 10mm pour les côtés
            filename: `rapport_final_${data.clientReference}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // Ajouter des sauts de page si nécessaire
        };
    
        html2pdf().from(element).set(opt).toPdf().get('pdf').then((pdf) => {
            const totalPages = pdf.internal.getNumberOfPages();
            pdf.setPage(1);
    
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.text(`Page ${i} sur ${totalPages}`, 190, 285, { align: 'right' });
            }
    
            pdf.save(`rapport_final_${id}.pdf`);
        });
    };
    

    if (error) {
        return <div className="error-message">Erreur : {error}</div>;
    }

    if (!data) {
        return <div className="loading-message">Chargement...</div>;
    }

    const groupedSamples = Object.entries(data.samples).reduce((acc, [sampleType, samples]) => {
        samples.forEach((sample) => {
            if (!acc[sample.sampleReference]) {
                acc[sample.sampleReference] = {
                    sampleType:sample.sampleType,
                    sampleDetails: sample,
                    analyses: {}
                };
            }
            const analysisKey = `${sample.analysis_id}`;
            if (!acc[sample.sampleReference].analyses[analysisKey]) {
                acc[sample.sampleReference].analyses[analysisKey] = {
                    analysisType: sample.analysisType,
                    parameter: sample.parameter,
                    technique: sample.technique,
                    elementsdinteret: [],
                    norme: sample.Used_norme || 'Norme Utilisée',
                    analysis_id: sample.analysis_id
                };
            }
            acc[sample.sampleReference].analyses[analysisKey].elementsdinteret.push({
                elementDinteret: sample.elementDinteret,
                Unite: sample.Unite,
                Valeur_Moyenne: sample.Valeur_Moyenne,
                Limite_Detection: sample.Limite_Detection,
                Incertitude: sample.Incertitude,
                Observation: sample.Observation,
                element_id: sample.element_id,
                Valeur_Norme_Utlise: sample.Valeur_Norme_Utlise
            });
        });
        return acc;
    }, {});

    const groupedSamplesArray = Object.entries(groupedSamples);
    const uniqueSampleCount = groupedSamplesArray.length;
    const sampleList = groupedSamplesArray.map(([sampleReference, { sampleType }], index) => (
        <div key={index} className="sample-item">
            <span className="sample-code">Code {sampleReference} :</span> {sampleType}
        </div>
    ));

    return (
        <div className="report-wrapper">
            <div className="report-container" id="report-container">
                <header className="report-header">
                    <h1>RÉSULTATS D'ANALYSES</h1>
                    <p>
                        <strong>Référence Client :</strong> {data.clientReference}
                    </p>
                    <p className="date-location">
                        <strong>Antananarivo, le</strong>{' '}
                        {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </header>

                <section className="client-info">
                    <h2>Informations du Client</h2>
                    <p>
                        <strong>Nom :</strong> {data.client_name}
                    </p>
                    <p>
                        <strong>Adresse :</strong> {data.client_address}
                    </p>
                    <p>
                        <strong>Téléphone :</strong> {data.client_phone}
                    </p>
                    <p className="sample-count">
                        <strong>Nombre d’échantillons :</strong> {uniqueSampleCount} échantillon{uniqueSampleCount > 1 ? 's' : ''}.
                    </p>
                    <div className="sample-list">
                        {sampleList}
                    </div>
                    <p>
                        <strong>Date d'arrivée :</strong> {new Date(data.requestingDate).toLocaleDateString()}
                    </p>
                </section>

                <section className="reportconclusion-section">
                    <h2>1. Conclusion</h2>
                    <p>{data.conclusion}</p>
                </section>

                <section className="reportresults-section">
                    <h2>2. Résultats</h2>
                    <p>Les résultats d’analyses sont reportés dans les tableaux ci-dessous.</p>
                </section>

                {groupedSamplesArray.map(([sampleReference, { sampleType, sampleDetails, analyses }], index) => (
                    <div className="reportsample-section" key={index}>
                        <h3>Échantillon {index + 1} : {sampleType} - Code {sampleReference}</h3>
                        <p>
                            <strong>Lieu de Prélèvement :</strong> {sampleDetails.samplingLocation}
                        </p>
                        <p>
                            <strong>Date de Prélèvement :</strong>{' '}
                            {new Date(sampleDetails.samplingDate).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                        <p>
                            <strong>Prélevé par :</strong> {sampleDetails.sampledBy}
                        </p>

                        {Object.entries(analyses).map(([analysisKey, { analysisType, parameter, technique, elementsdinteret, norme }], analysisIndex) => (
                            <div key={analysisKey} className="reportanalysis-section">
                                <h4>Analyse {analysisIndex + 1}: {analysisType} pour {sampleType.toUpperCase()}</h4>
                                <table className="reportanalysis-table">
                                    <thead>
                                        <tr>
                                            <th>Élément d'Intérêt</th>
                                            <th>Unité</th>
                                            <th>Valeur Moyenne</th>
                                            <th>Limite de Détection</th>
                                            <th>Technique Utilisée</th>
                                            <th>{norme}</th>
                                            <th>Observation</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {elementsdinteret.map((element, resultIndex) => (
                                            <tr key={resultIndex}>
                                                <td>{element.elementDinteret}</td>
                                                <td>{element.Unite}</td>
                                                <td>{element.Valeur_Moyenne}</td>
                                                <td>{element.Limite_Detection}</td>
                                                <td>{technique}</td>
                                                <td>{element.Valeur_Norme_Utlise}</td>
                                                <td>{element.Observation}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                ))}

            </div>

            <div className="reportbutton-container">
                <button className="report-download-button" onClick={handleDownload}>
                    Télécharger le PDF
                </button>
            </div>
        </div>
    );
};

export default GenirateRapport;
