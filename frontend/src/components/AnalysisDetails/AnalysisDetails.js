import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import './analysisdetails.css';

const AnalysisDetails = () => {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetch(`http://localhost/instnapp/backend/routes/analysisDetails.php?id=${id}`)
      .then(response => response.json())
      .then(data => setDetails(data))
      .catch(error => console.error('Error fetching analysis details:', error));
  }, [id]);

  const onDrop = (acceptedFiles) => {
    setFiles(acceptedFiles);
    // You can handle file upload here (e.g., send to the server)
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: ['.xlsx', '.csv'] });

  if (!details) {
    return <div>Loading...</div>;
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
    </div>
  );
};

export default AnalysisDetails;
