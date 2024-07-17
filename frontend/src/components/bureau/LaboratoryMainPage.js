import React from 'react';
import { useNavigate } from 'react-router-dom';

const LaboratoryMainPage = () => {
    const navigate = useNavigate();

    const handleNewRequests = () => {
        navigate('/bureau/new-requests');
    };

    const handleProcessedRequests = () => {
        navigate('/bureau/processed-requests');
    };

    const handleDashboard = () => {
        navigate('/bureau/dashboard');
    };

    return (
        <div>
            <button onClick={handleNewRequests}>New Requests</button>
            <button onClick={handleProcessedRequests}>Processed Requests</button>
            <button onClick={handleDashboard}>Dashboard</button>
        </div>
    );
};

export default LaboratoryMainPage;
