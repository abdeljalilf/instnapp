import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './RequestDetails.css'; // Assurez-vous d'avoir un fichier CSS pour le style

const RequestDetails = () => {
    const { id } = useParams();
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:3000/backend/bureau/getRequestDetails.php?id=${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Fetched data:', data);
                setRequests(data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setRequests([]);
            });
    }, [id]);

    if (requests.length === 0) {
        return <div>Loading...</div>;
    }

    // Regrouper les analyses par échantillon en utilisant l'identifiant de l'échantillon
    const groupedData = requests.reduce((acc, curr) => {
        const sampleId = curr.echantillon_id;
        if (!acc[sampleId]) {
            acc[sampleId] = {
                sampleType: curr.sampleType,
                analyses: [],
            };
        }
        acc[sampleId].analyses.push({
            analysisType: curr.analysisType,
            parameter: curr.parameter,
            technique: curr.technique,
        });
        return acc;
    }, {});

    return (
        <div className="request-details-container">
            <h2>Détails de la demande {requests[0].demande_id}</h2>
            <p>Date de livraison: {requests[0].delais_livraison}</p>

            <h3>Informations sur les échantillons et les analyses</h3>
            {Object.keys(groupedData).map((sampleId, sampleIndex) => (
                <div key={sampleId} className="request-section">
                    <h4>Échantillon {sampleIndex + 1} : {groupedData[sampleId].sampleType}</h4>
                    {groupedData[sampleId].analyses.map((analysis, analysisIndex) => (
                        <div key={analysisIndex} className="analysis-section">
                            <h5>Analyse {analysisIndex + 1}</h5>
                            <table className="request-table">
                                <tbody>
                                    <tr>
                                        <th>Type d'analyse</th>
                                        <td>{analysis.analysisType}</td>
                                    </tr>
                                    <tr>
                                        <th>Paramètre</th>
                                        <td>{analysis.parameter}</td>
                                    </tr>
                                    <tr>
                                        <th>Technique</th>
                                        <td>{analysis.technique}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default RequestDetails;
