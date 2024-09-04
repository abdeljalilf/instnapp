import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Archive_rapports.css';

const ArchiveResultats = () => {
    const { department } = useParams(); // Get the department from the URL
    const [files, setFiles] = useState([]);
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const session_id = localStorage.getItem('session_id');

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/instnapp/backend/routes/bureau/Archive_rapports.php?department=${department}`, {
                    headers: {
                        Authorization: session_id
                    }
                });
                const data = await response.json();
                console.log('Response from server:', data);

                if (data.success) {
                    setFiles(data.data);
                    setFilteredFiles(data.data);
                } else {
                    setError(data.message || 'Erreur lors de la récupération des fichiers.');
                }
            } catch (err) {
                setError('Erreur lors de la récupération des fichiers.');
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, [apiBaseUrl, department, session_id]);

    const handleSearch = (event) => {
        const term = event.target.value;
        setSearchTerm(term);

        if (term.trim() === '') {
            setFilteredFiles(files);
        } else {
            const filtered = files.filter(file =>
                file.file_name.toLowerCase().includes(term.toLowerCase()) ||
                file.clientReference.toLowerCase().includes(term.toLowerCase()) ||
                file.samples.some(sample =>
                    sample.sampleReference.toLowerCase().includes(term.toLowerCase())
                )
            );
            setFilteredFiles(filtered);
        }
    };

    const renderSampleList = (samples) => {
        return samples.map(sample => (
            <div key={sample.sample_id}>
                <strong>Référence d'Échantillon:</strong> {sample.sampleReference}<br/>
                <strong>Type d'Échantillon:</strong> {sample.sampleType}<br/>
            </div>
        ));
    };

    return (
        <div className="table-container-archive-rapports">
            <h2>Archive des Résultats</h2>

            {/* Barre de recherche */}
            <input
                type="text"
                placeholder="Rechercher par Référence de demande, Nom de fichier, Référence d'échantillon"
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
            />

            {loading ? (
                <div>Chargement des données...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <table className="table-archive-rapports">
                    <thead>
                        <tr>
                            <th>Référence de la Demande</th>
                            <th>Référence d'Échantillon</th>
                            <th>Type d'Échantillon</th>
                            <th>Date de Téléchargement</th>
                            <th>Nom du Fichier</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFiles.map(file => (
                            <tr key={file.id}>
                                <td>{file.clientReference}</td>
                                <td>
                                    {file.samples.map(sample => (
                                        <div key={sample.sample_id}>{sample.sampleReference}</div>
                                    ))}
                                </td>
                                <td>
                                    {file.samples.map(sample => (
                                        <div key={sample.sample_id}>{sample.sampleType}</div>
                                    ))}
                                </td>
                                <td>{new Date(file.uploaded_at).toLocaleString()}</td>
                                <td>{file.file_name}</td>
                                <td>
                                    <a
                                        href={`${apiBaseUrl}/${file.file_path}`}
                                        download={file.file_name}
                                        className="btn-primary"
                                    >
                                        Télécharger
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ArchiveResultats;
