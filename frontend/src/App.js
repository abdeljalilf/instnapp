// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DemandesForm from './components/reception/DemandesForm/DemandesForm';
import DemandeList from './components/reception/DemandesList/DemandesList';
import MainPage from './components/reception/MainPage/MainPage';
import DemandesDetails from './components/reception/DemandesDetails/DemandesDetails';
import FicheTechnique from './components/reception/FicheTechnique/FicheTechnique';
import Statistiques from './components/reception/Statistiques/Statistiques';
import FinanceDemandesList from './components/finance/FinanceDemandeList/FinanceDemandesList';
import FinanceMainPage from './components/finance/FinanceMainPage/FinanceMainPage';
import FinanceDemandesDetails from './components/finance/FinanceDemandesDetails/FinanceDemandesDetails';
import LaboratoryMainPage from './components/bureau/LaboratoryMainPage/LaboratoryMainPage';
import NewRequests from './components/bureau/NewRequests/NewRequests';
import ProcessedRequests from './components/bureau/ProcessedRequests/ProcessedRequests';
import Dashboard from './components/bureau/Dashboard/Dashboard';
import RequestDetails from './components/bureau/RequestDetails/RequestDetails';
import Rapport from './components/bureau/Rapport/Rapport';
import RapportFinal from './components/bureau/RapportFinal/RapportFinal'; 
import Shoose_departement from './components/bureau/Shoose_departement/Shoose_departement'; 
import WelcomePage from './components/welcomePage/WelcomePage';
import AnalysisDetails from './components/laboratory/AnalysisDetails/AnalysisDetails';
import Laboratoire from './components/laboratory/laboratoire/Laboratoire';
import LaboMainPage from './components/laboratory/LaboMainPage/LaboMainPage';
import AnalysisList from './components/laboratory/AnalysisList/AnalysisList'; // Import the AnalysisList component

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/finance" element={<FinanceMainPage />}>
                    <Route index element={<FinanceDemandesList />} />
                    <Route path="/finance/NouvellesDemandes" element={<FinanceDemandesList />} />
                    <Route path="/finance/DetailesDemandes/:clientId" element={<FinanceDemandesDetails />} />
                </Route>
                <Route path="/reception" element={<MainPage />}>
                    <Route index element={<Statistiques />} /> {/* Route par défaut */}
                    <Route path="Statistiques" element={<Statistiques />} />
                    <Route path="DemandesForm" element={<DemandesForm />} />
                    <Route path="DemandesList" element={<DemandeList />} />
                    <Route path="DemandesList/:clientId" element={<DemandesDetails />} />
                    <Route path="DemandesList/fiche-technique/:clientId" element={<FicheTechnique />} />
                </Route>
                <Route path="/bureau" element={<Shoose_departement />} />
                <Route path="/bureau/:department" element={<LaboratoryMainPage />}>
                    <Route index element={<Dashboard />} /> {/* Default route */}
                    <Route path="new-requests" element={<NewRequests />} />
                    <Route path="processed-requests" element={<ProcessedRequests />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="request/:id" element={<RequestDetails />} />
                    <Route path="rapport/:id" element={<Rapport />} />
                    <Route path="rapportfinal/:id" element={<RapportFinal />} />
                </Route>
                <Route path="/laboratoire" element={<LaboMainPage />}>
                    <Route index element={<Laboratoire />} />
                    <Route path="analyses/:selectedLabo" element={<AnalysisList />} /> {/* New route for AnalysisList */}
                    <Route path="analysis-details/:id" element={<AnalysisDetails />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default App;
