import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserForm from './components/reception/UserForm/UserForm';
import DemandeList from './components/reception/DemandeList/DemandesList';
import MainPage from './components/reception/MainPage/MainPage'
import DemandesDetails from './components/reception/DemandesDetails/DemandesDetails';
import FicheTechnique from './components/reception/FicheTechnique/FicheTechnique';
const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/reception" element={<MainPage />}>
                    <Route index element={<UserForm />} /> {/* Route par défaut */}
                    <Route path="requests-details" element={<DemandeList />} />
                    <Route path="requests-details/:clientId" element={<DemandesDetails />} />
                    <Route path="requests-details/fiche-technique/:clientId" element={<FicheTechnique />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default App;