// frontend/src/components/bureau/Shoose_departement/Shoose_departement.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Shoose_departement.css';

const Shoose_departement = () => {
    const navigate = useNavigate();

    const handleSelection = (event) => {
        const selectedValue = event.target.value;
        if (selectedValue) {
            navigate(`/bureau/${selectedValue}`);
        }
    };

    return (
        <div className="Shoose_departement">
            <h1>Bienvenue</h1>
            <select onChange={handleSelection} defaultValue="">
                <option value="" disabled>Choisissez un départemet</option>
                <option value="TFXE">TFXE</option>
                <option value="ATN">ATN</option>
                <option value="Hi">Hi</option>
            </select>
        </div>
    );
};

export default Shoose_departement;
