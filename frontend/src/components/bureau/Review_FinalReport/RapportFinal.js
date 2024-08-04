// RapportFinal.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './RapportFinal.css';

const RapportFinal = () => {
    const { id, department } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        if (id && department) {
            console.log("Fetching data with demande_id:", id, "and department:", department);

            fetch(`${apiBaseUrl}/instnapp/backend/routes/bureau/rapport.php?demande_id=${id}&department=${department}`)
                .then((response) => {
                    console.log("Response status:", response.status);
                    return response.text();  // Utilisez text() pour voir la réponse brute
                })
                .then((text) => {
                    console.log("Response text:", text);
                    try {
                        const data = JSON.parse(text);
                        if (data.error) {
                            setError(data.error);
                        } else {
                            setData(data.reports[0]); // Assuming data is an array with a single element
                        }
                    } catch (error) {
                        setError('Failed to parse JSON');
                    }
                })
                .catch((error) => {
                    console.error("Error fetching data:", error);
                    setError(error.message);
                });

        } else {
            setError('Invalid demande_id provided');
        }
    }, [id, department]);

    // RapportFinal.js

const handleGenerateReport = () => {
    if (window.confirm("Êtes-vous sûr des données car cette étape est irréversible ?")) {
        fetch(`${apiBaseUrl}/instnapp/backend/routes/bureau/validaterapport.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ demande_id: id, newValidatedValue: 'office_step_2' }) // Ensure 'demande_id' is the client_id
        })
            .then(response => {
                console.log('Response:', response);
                return response.text();
            })
            .then(text => {
                console.log('Response Text:', text);
                try {
                    const result = JSON.parse(text);
                    if (result.success) {
                        navigate(`/bureau/${department}/GenerateRapport/${id}`);
                    } else {
                        setError(result.error || 'Failed to update analysis validation status');
                    }
                } catch (error) {
                    setError('Erreur lors de l\'analyse de la réponse JSON');
                    console.error('JSON Parse Error:', error);
                }
            })
            .catch(error => {
                console.error("Error updating analysis validation status:", error);
                setError(error.message);
            });
    }
};


    const handleModifyResults = () => {
        navigate(`/bureau/${department}/rapport/${id}`);
    };

    if (error) {
        return <div className="error-message">Erreur : {error}</div>;
    }

    if (!data) {
        return <div className="loading-message">Chargement...</div>;
    }

    // Regroupement des analyses par échantillon et par analyse
    const groupedSamples = Object.entries(data.samples).reduce((acc, [sampleType, samples]) => {
        samples.forEach((sample) => {
            if (!acc[sample.sampleReference]) {
                acc[sample.sampleReference] = {
                    sampleType,
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
                    norme: sample.Used_norme || 'Norme Utilisée', // Assurez-vous d'utiliser la norme correcte
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

    return (
        <div className="rapport-final-container">
            <header className="report-header">
                <h1>RÉSULTATS D'ANALYSES</h1>
                <p className="date-location">
                    <strong>Antananarivo, le</strong>{' '}
                    {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </header>

            <section className="conclusion-section">
                <h2>1. Conclusion</h2>
                <p>{data.conclusion}</p>
            </section>

            <section className="results-section">
                <h2>2. Résultats</h2>
                <p>Les résultats d’analyses sont reportés dans les tableaux ci-dessous.</p>
            </section>

            {groupedSamplesArray.map(([sampleReference, { sampleType, sampleDetails, analyses }], index) => (
                <div className="sample-section" key={index}>
                    <h3>Échantillon {index + 1} : {sampleType} - Code {sampleReference}</h3>
                    <p>
                        <strong>Lieu de Prélèvement :</strong> {sampleDetails.samplingLocation}
                    </p>
                    <p>
                        <strong>Date de Prélèvement :</strong>{' '}
                        {new Date(sampleDetails.samplingDate).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                    <p>
                        <strong>Prélevé par :</strong> {sampleDetails.sampledBy}
                    </p>

                    {Object.entries(analyses).map(([analysisKey, { analysisType, parameter, technique, elementsdinteret, norme }], analysisIndex) => (
                        <div key={analysisKey} className="analysis-section">
                            <h4>Analyse {analysisIndex + 1}: {analysisType} pour {sampleType.toUpperCase()}</h4>
                            <table className="analysis-table">
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
                                            <td>
                                                {element.Valeur_Moyenne}
                                                {element.Incertitude && element.Incertitude.trim() !== '' && element.Incertitude !== '0' ? ` ± ${element.Incertitude}` : ''}
                                            </td>
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

            <footer className="report-footer">
                <p>
                    Fait à Antananarivo, le{' '}
                    {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p>Chef du département des analyses</p>
            </footer>

            <div className="signature-space"></div>
            
            <div className="buttons-container">
                <button onClick={handleGenerateReport}>Générer le rapport</button>
                <button onClick={handleModifyResults}>Modifier les résultats</button>
            </div>
        </div>
    );
};

export default RapportFinal;
