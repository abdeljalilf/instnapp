import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import DemandesForm from './components/reception/DemandesForm/DemandesForm';
import DemandeList from './components/reception/DemandesList/DemandesList';
import MainPage from './components/reception/MainPage/MainPage';
import DemandesDetails from './components/reception/DemandesDetails/DemandesDetails';
import FicheTechnique from './components/reception/FicheTechnique/FicheTechnique';
import Statistiques from './components/reception/Statistiques/Statistiques';
import FinanceDemandesList from './components/finance/FinanceDemandeList/FinanceDemandesList';
import FinanceMainPage from './components/finance/FinanceMainPage/FinanceMainPage';
import FinanceDemandesDetails from './components/finance/FinanceDemandesDetails/FinanceDemandesDetails';
const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />}>
                    <Route index element={<Statistiques />} /> {/* Route par défaut */}
                    <Route path="reception/Statistiques" element={<Statistiques />} />
                    <Route path="reception/DemandesForm" element={<DemandesForm />} />
                    <Route path="reception/DemandesList" element={<DemandeList />} />
                    <Route path="reception/DemandesList/:clientId" element={<DemandesDetails />} />
                    <Route path="reception/DemandesList/fiche-technique/:clientId" element={<FicheTechnique />} />
                    <Route path="reception" element={<Navigate to="reception/Statistiques" />} /> {/* Redirection pour reception */}
                </Route>
                <Route path="/finance" element={<FinanceMainPage />}>
                <Route index element={<FinanceDemandesList />} />
                    <Route path="/finance/NouvellesDemandes" element={<FinanceDemandesList />} />
                    <Route path="/finance/DetailesDemandes/:clientId" element={<FinanceDemandesDetails />} />
                </Route>
                {/* <Route path="*" element={<Navigate to="/" />} />  */}
                {/* Redirection pour toutes les autres routes */}
            </Routes>
        </Router>
    );
};

export default App;
