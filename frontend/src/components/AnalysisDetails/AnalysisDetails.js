import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import './analysisdetails.css';

const AnalysisDetails = () => {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch(`http://localhost/instnapp/backend/routes/analysisDetails.php?id=${id}`)
      .then(response => response.json())
      .then(data => {
        console.log(data); // Log the data to the console
        setDetails(data);
        // Initialize results with the elements of interest
        setResults(data.elementDinteret.map(element => ({
          element,
          concentrationMoyenne: '',
          incertitude: '',
          unite: 'g/L' // Default value
        })));
      })
      .catch(error => console.error('Error fetching analysis details:', error));
  }, [id]);

  const onDrop = (acceptedFiles) => {
    setFiles(acceptedFiles);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: ['.xlsx', '.csv'] });

  const handleResultChange = (index, field, value) => {
    const newResults = [...results];
    newResults[index][field] = value;
    setResults(newResults);
  };

  const handleSaveResults = () => {
    fetch(`http://localhost/instnapp/backend/routes/analysisDetails.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ analysisId: id, results }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Results saved:', data);
        console.log('Résultats validés avec succès'); // Success message
      })
      .catch(error => console.error('Error saving results:', error));
  };

  if (!details) {
    return <div>Loading...</div>;
  }

  if (details.error) {
    return <div>{details.error}</div>;
  }

  return (
    <div className="details-container">
      <h1>Analysis Details</h1>
      <table>
        <tbody>
          <tr>
            <td>ID:</td>
            <td>{details.id}</td>
          </tr>
          <tr>
            <td>Parameter:</td>
            <td>{details.parameter}</td>
          </tr>
          <tr>
            <td>Sample Reference:</td>
            <td>{details.sampleReference}</td>
          </tr>
          <tr>
            <td>Analysis Type:</td>
            <td>{details.analysisType}</td>
          </tr>
          <tr>
            <td>Technique:</td>
            <td>{details.technique}</td>
          </tr>
          <tr>
            <td>Elements d'interet:</td>
            <td>{details.elementDinteret.join(', ')}</td>
          </tr>
          <tr>
            <td>Sample Type:</td>
            <td>{details.sampleType}</td>
          </tr>
          <tr>
            <td>Sampling Location:</td>
            <td>{details.samplingLocation}</td>
          </tr>
          <tr>
            <td>Sampling Date:</td>
            <td>{details.samplingDate}</td>
          </tr>
        </tbody>
      </table>

      <section className="file-upload-section">
        <h2>Upload Results</h2>
        <div {...getRootProps({ className: 'dropzone' })}>
          <input {...getInputProps()} />
          <p>Drag & drop some files here, or click to select files</p>
        </div>
        <aside>
          <h4>Files</h4>
          <ul>
            {files.map(file => (
              <li key={file.path}>{file.path} - {file.size} bytes</li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="results-section">
        <h2>Enter Results</h2>
        <table>
          <thead>
            <tr>
              <th>Element</th>
              <th>Concentration Moyenne</th>
              <th>Incertitude</th>
              <th>Unité</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td>{result.element}</td>
                <td>
                  <input
                    type="number"
                    value={result.concentrationMoyenne}
                    onChange={(e) => handleResultChange(index, 'concentrationMoyenne', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={result.incertitude}
                    onChange={(e) => handleResultChange(index, 'incertitude', e.target.value)}
                  />
                </td>
                <td>
                  <select
                    value={result.unite}
                    onChange={(e) => handleResultChange(index, 'unite', e.target.value)}
                  >
                    <option value="g/L">g/L</option>
                    <option value="mg/L">mg/L</option>
                    <option value="µg/L">µg/L</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={handleSaveResults} className="valider-button">Valider</button>
      </section>
    </div>
  );
};

export default AnalysisDetails;
