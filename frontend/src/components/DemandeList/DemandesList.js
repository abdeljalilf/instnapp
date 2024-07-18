import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DemandesList.css';

const DemandesList = () => {
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    

    useEffect(() => {
        const fetchDemandes = async () => {
            try {
                const response = await axios.get('http://192.168.56.1/instnapp/backend/routes/demandelist.php');
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

        fetchDemandes();
    }, []);

    if (loading) return <div className="loader">Chargement...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="demandes-container">
            <h2>Liste des Demandes d'Analyses</h2>
            <table className="demandes-table">
                <thead>
                    <tr>
                        <th>Reference Client</th>
                        <th>Client</th>
                        <th>Adresse</th>
                        <th>Téléphone</th>
                        <th>Email</th>
                        <th>Échantillons</th>
                    </tr>
                </thead>
                <tbody>
                    {demandes.map((demande) => (
                        <tr key={demande.clientId}>
                            <td>{demande.clientReference}</td>
                            <td>{demande.name}</td>
                            <td>{demande.address}</td>
                            <td>{demande.phone}</td>
                            <td>{demande.email}</td>
                            <td>
                                <table className="inner-table">
                                    <thead>
                                        <tr>
                                            <th>Reference de l'echantillon</th>
                                            <th>Type</th>
                                            <th>Lieu de Prélèvement</th>
                                            <th>Date de Prélèvement</th>
                                            <th>Prélevé Par</th>
                                            <th>Analyses</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {demande.echantillons.map((echantillon) => (
                                            <tr key={echantillon.echantillonId}>
                                                <td>{echantillon.sampleReference}</td>
                                                <td>{echantillon.sampleType}</td>
                                                <td>{echantillon.samplingLocation}</td>
                                                <td>{echantillon.samplingDate}</td>
                                                <td>{echantillon.sampledBy}</td>
                                                <td>
                                                    <table className="inner-inner-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Type d'Analyse</th>
                                                                <th>Paramètre</th>
                                                                <th>Technique</th>
                                                                <th>Éléments d'Intérêt</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {echantillon.analyses.map((analysis) => (
                                                                <tr key={analysis.analysisId}>
                                                                    <td>{analysis.analysisType}</td>
                                                                    <td>{analysis.parameter}</td>
                                                                    <td>{analysis.technique}</td>
                                                                    <td>
                                                                        {analysis.elementsDinteret.map((element) => (
                                                                            <div key={element.elementId}>
                                                                                {element.elementDinteret}
                                                                            </div>
                                                                        ))}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DemandesList;
