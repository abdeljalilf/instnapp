// src/components/laboratory/Laboratoire.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Laboratoire.css';

const Laboratoire = () => {
  const labos = ['TFXE', 'ATN', 'HI'];
  const [selectedLabo, setSelectedLabo] = useState('');
  const navigate = useNavigate();

  const handleLaboChange = (event) => {
    const labo = event.target.value;
    setSelectedLabo(labo);
    navigate(`/laboratoire/analyses/${labo}`);
  };

  return (
    <div className="labo-container">
      <div className="labo-header">
        <h1>Select Labo</h1>
      </div>
      <div className="labo-select-group">
        <select value={selectedLabo} onChange={handleLaboChange} className="labo-select">
          <option value="" disabled>Select a labo</option>
          {labos.map(labo => (
            <option key={labo} value={labo}>{labo}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Laboratoire;
