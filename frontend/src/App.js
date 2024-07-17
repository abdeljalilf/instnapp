import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserForm from './components/formclient/UserForm';
import LaboratoryMainPage from './components/bureau/LaboratoryMainPage';
import NewRequests from './components/bureau/NewRequests';
import ProcessedRequests from './components/bureau/ProcessedRequests';
import Dashboard from './components/bureau/Dashboard';

import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <h1>INSTN</h1>
                </header>
                <Routes>
                    <Route path="/" element={<UserForm />} />
                    <Route path="/bureau" element={<LaboratoryMainPage />} />
                    <Route path="/bureau/new-requests" element={<NewRequests />} />
                    <Route path="/bureau/processed-requests" element={<ProcessedRequests />} />
                    <Route path="/bureau/dashboard" element={<Dashboard />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
