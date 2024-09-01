import React, { useEffect, useState } from 'react';
import './Archive_rapports.css';

const ArchiveResultats = () => {
    const [files, setFiles] = useState([]);
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/instnapp/backend/routes/bureau/Archive_rapports.php`);
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
    }, [apiBaseUrl]);

    const handleSearch = (event) => {
        const term = event.target.value;
        setSearchTerm(term);

        if (term.trim() === '') {
            setFilteredFiles(files);
        } else {
            const filtered = files.filter(file =>
                file.file_name.toLowerCase().includes(term.toLowerCase()) ||
                file.clientReference.toLowerCase().includes(term.toLowerCase()) ||
                file.sampleReference.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredFiles(filtered);
        }
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
                            <th>Type d'Échantillon</th>
                            <th>Référence d'Échantillon</th>
                            <th>Date de Téléchargement</th>
                            <th>Nom du Fichier</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFiles.map(file => (
                            <tr key={file.id}>
                                <td>{file.clientReference}</td>
                                <td>{file.sampleType}</td>
                                <td>{file.sampleReference}</td>
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
