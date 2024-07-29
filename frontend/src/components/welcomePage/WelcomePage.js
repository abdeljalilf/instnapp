// src/components/WelcomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css'; // Vous pouvez ajouter des styles CSS si nécessaire

const WelcomePage = () => {
    const navigate = useNavigate();

    const handleSelection = (event) => {
        const selectedValue = event.target.value;
        if (selectedValue) {
            navigate(selectedValue);
        }
    };

    return (
        <div className="welcome-page">
            <h1>Bienvenue</h1>
            <select onChange={handleSelection} defaultValue="">
                <option value="" disabled>Choisissez un volet</option>
                <option value="/reception">Réception</option>
                <option value="/finance">Finance</option>
                <option value="/bureau">Bureau</option>
                <option value="/laboratoire">Laboratoire</option>
            </select>
        </div>
    );
};

export default WelcomePage;
