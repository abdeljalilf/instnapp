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
import AnalysisDetails from './components/laboratory/AnalysisDetails/AnalysisDetails';
import LaboratoryMainPage from './components/bureau/LaboratoryMainPage/LaboratoryMainPage';
import NewRequests from './components/bureau/NewRequests/NewRequests';
import ProcessedRequests from './components/bureau/ProcessedRequests/ProcessedRequests';
import Dashboard from './components/bureau/Dashboard/Dashboard';
import RequestDetails from './components/bureau/RequestDetails/RequestDetails';
import Rapport from './components/bureau/Rapport/Rapport';
import RapportFinal from './components/bureau/RapportFinal/RapportFinal'; 
import Laboratoire from './components/laboratory/laboratoire/Laboratoire';
import LaboMainPage from './components/laboratory/LaboMainPage/LaboMainPage';
import AdminPanel from './components/admin/AdminPanel/AdminPanel';
import Login from './components/Login/Login';
import ProtectedRoute from './components/Login/ProtectedRoute';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/finance" element={<ProtectedRoute element={<FinanceMainPage />} roleRequired="finance" />}>
                    <Route index element={<ProtectedRoute element={<FinanceDemandesList />} roleRequired="finance" />} />
                    <Route path="NouvellesDemandes" element={<ProtectedRoute element={<FinanceDemandesList />} roleRequired="finance" />} />
                    <Route path="DetailesDemandes/:clientId" element={<ProtectedRoute element={<FinanceDemandesDetails />} roleRequired="finance" />} />
                </Route>
                <Route path="/reception" element={<ProtectedRoute element={<MainPage />} roleRequired="reception" />}>
                    <Route index element={<ProtectedRoute element={<Statistiques />} roleRequired="reception" />} />
                    <Route path="Statistiques" element={<ProtectedRoute element={<Statistiques />} roleRequired="reception" />} />
                    <Route path="DemandesForm" element={<ProtectedRoute element={<DemandesForm />} roleRequired="reception" />} />
                    <Route path="DemandesList" element={<ProtectedRoute element={<DemandeList />} roleRequired="reception" />} />
                    <Route path="DemandesList/:clientId" element={<ProtectedRoute element={<DemandesDetails />} roleRequired="reception" />} />
                    <Route path="DemandesList/fiche-technique/:clientId" element={<ProtectedRoute element={<FicheTechnique />} roleRequired="reception" />} />
                </Route>
                <Route path="/bureau" element={<ProtectedRoute element={<LaboratoryMainPage />} roleRequired="bureau" />}>
                    <Route index element={<ProtectedRoute element={<Dashboard />} roleRequired="bureau" />} />
                    <Route path="new-requests" element={<ProtectedRoute element={<NewRequests />} roleRequired="bureau" />} />
                    <Route path="processed-requests" element={<ProtectedRoute element={<ProcessedRequests />} roleRequired="bureau" />} />
                    <Route path="dashboard" element={<ProtectedRoute element={<Dashboard />} roleRequired="bureau" />} />
                    <Route path="request/:id" element={<ProtectedRoute element={<RequestDetails />} roleRequired="bureau" />} />
                    <Route path="rapport/:id" element={<ProtectedRoute element={<Rapport />} roleRequired="bureau" />} />
                    <Route path="rapportfinal/:id" element={<ProtectedRoute element={<RapportFinal />} roleRequired="bureau" />} />
                </Route>
                <Route path="/laboratoire" element={<ProtectedRoute element={<LaboMainPage />} roleRequired="laboratory" />}>
                    <Route index element={<ProtectedRoute element={<Laboratoire />} roleRequired="laboratory" />} />
                    <Route path="analysis-details/:id" element={<ProtectedRoute element={<AnalysisDetails />} roleRequired="laboratory" />} />
                </Route>
                <Route path="/admin" element={<ProtectedRoute element={<AdminPanel />} roleRequired="admin" />} />
            </Routes>
        </Router>
    );
};

export default App;
