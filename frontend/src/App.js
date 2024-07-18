import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserForm from './components/formclient/UserForm';
import LaboratoryMainPage from './components/bureau/LaboratoryMainPage';
import NewRequests from './components/bureau/NewRequests';
import ProcessedRequests from './components/bureau/ProcessedRequests';
import Dashboard from './components/bureau/Dashboard';
import RequestDetails from './components/bureau/RequestDetails';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<UserForm />} />
                <Route path="/bureau" element={<LaboratoryMainPage />}>
                    <Route index element={<Dashboard />} /> {/* Route par défaut */}
                    <Route path="new-requests" element={<NewRequests />} />
                    <Route path="processed-requests" element={<ProcessedRequests />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="request/:id" element={<RequestDetails />} /> {/* Route pour les détails */}
                </Route>
            </Routes>
        </Router>
    );
};

export default App;
