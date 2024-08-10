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
import Archive from './components/bureau/Dashboard/Archive/Archive';
import INSTN from './components/bureau/Dashboard/INSTN/INSTN';
import Department from './components/bureau/Dashboard/Department/Department';
import RequestDetails from './components/bureau/RequestDetails/RequestDetails';
import Rapport from './components/bureau/EnterReport/Rapport';
import RapportFinal from './components/bureau/Review_FinalReport/RapportFinal'; 
import Shoose_departement from './components/bureau/Shoose_departement/Shoose_departement';
import GenerateRapport from './components/bureau/GenerateReport/GenerateRapport'; 
import Laboratoire from './components/laboratory/laboratoire/Laboratoire';
import LaboMainPage from './components/laboratory/LaboMainPage/LaboMainPage';
import AnalysisList from './components/laboratory/AnalysisList/AnalysisList'; // Import the AnalysisList component
import Login from './components/Login/Login';
import ProtectedRoute from './components/Login/ProtectedRoute';
import AdminPanel from './components/admin/AdminPanel/AdminPanel';



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
                <Route path="/bureau" element={<LaboratoryMainPage />} />
                <Route path="/bureau/:department" element={<LaboratoryMainPage />}>
                    <Route index element={<Dashboard />} /> {/* Default route */}
                    <Route path="new-requests" element={<NewRequests />} />
                    <Route path="processed-requests" element={<ProcessedRequests />} />
                    <Route path="dashboard" element={<Dashboard />}>
                        {/* Additional Dashboard Routes */}
                        <Route path="instn" element={<INSTN />} />
                        <Route path="department" element={<Department />} />
                        <Route path="archive" element={<Archive />} />
                    </Route>
                    <Route path="request/:id" element={<RequestDetails />} />
                    <Route path="rapport/:id" element={<Rapport />} />
                    <Route path="rapportfinal/:id" element={<RapportFinal />} />
                    <Route path="GenerateRapport/:id" element={<GenerateRapport />} />
                </Route>
                <Route path="/laboratoire" element={<LaboMainPage />}>
                    <Route index element={<Laboratoire />} />
                    <Route path="analyses/:selectedLabo" element={<AnalysisList />} /> {/* New route for AnalysisList */}
                    <Route path="analysis-details/:id" element={<AnalysisDetails />} />
                </Route>
                <Route path="/admin" element={<ProtectedRoute element={<AdminPanel />} roleRequired="admin" />} />
            </Routes>
        </Router>
    );
};

export default App;