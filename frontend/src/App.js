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
import Archive_resultats from './components/bureau/Dashboard/Archive_resultats/Archive_resultats';
import Archive_rapports from './components/bureau/Dashboard/Archive_rapports/Archive_rapports';
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
import ChangePassword from './components/Login/ChangePassword';
import AdminMainPage from './components/admin/AdminMainPage/AdminMainPage';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/changePassword" element={<ChangePassword />} />
                <Route path="/finance" element={<ProtectedRoute element={<FinanceMainPage />} roleRequired="finance" />}>
                    <Route index element={<ProtectedRoute element={<FinanceDemandesList />} roleRequired="finance" />} />
                    <Route path="NouvellesDemandes" element={<ProtectedRoute element={<FinanceDemandesList />} roleRequired="finance" />} />
                    <Route path="DetailesDemandes/:clientId" element={<ProtectedRoute element={<FinanceDemandesDetails />} roleRequired="finance" />} />
                </Route>
                <Route path="/reception" element={<ProtectedRoute element={<MainPage />} roleRequired="reception" />}>
                    <Route index element={<ProtectedRoute element={<Statistiques />} roleRequired="reception" />} />
                    <Route path="Statistiques" element={<ProtectedRoute element={<Statistiques />} roleRequired="reception" />} />
                    <Route path="Statistiques/:department" element={<ProtectedRoute element={<Statistiques />} roleRequired="reception" />} /> {/* Ajout de la sous-route */}
                    <Route path="DemandesForm" element={<ProtectedRoute element={<DemandesForm />} roleRequired="reception" />} />
                    <Route path="DemandesList" element={<ProtectedRoute element={<DemandeList />} roleRequired="reception" />} />
                    <Route path="DemandesList/:clientId" element={<ProtectedRoute element={<DemandesDetails />} roleRequired="reception" />} />
                    <Route path="DemandesList/fiche-technique/:clientId" element={<ProtectedRoute element={<FicheTechnique />} roleRequired="reception" />} />
                </Route>
                <Route path="/bureau/:department" element={<ProtectedRoute element={<LaboratoryMainPage />} roleRequired="bureau" />}>
                    <Route index element={<ProtectedRoute element={<NewRequests />} roleRequired="bureau" />} /> {/* Default route */}
                    <Route path="new-requests" element={<ProtectedRoute element={<NewRequests />} roleRequired="bureau" />} />
                    <Route path="processed-requests" element={<ProtectedRoute element={<ProcessedRequests />} roleRequired="bureau" />} />
                    <Route path="dashboard" element={<ProtectedRoute element={<Dashboard />} roleRequired="bureau" />}>
                        {/* Additional Dashboard Routes */}
                        <Route path=":department" element={<ProtectedRoute element={<Department />} roleRequired="bureau" />} />
                        <Route path="archive" element={<ProtectedRoute element={<Archive />} roleRequired="bureau" />} />
                        <Route path="archive_resultats" element={<ProtectedRoute element={<Archive_resultats />} roleRequired="bureau" />} />
                        <Route path="archive_rapports" element={<ProtectedRoute element={<Archive_rapports />} roleRequired="bureau" />} />
                    </Route>
                    <Route path="request/:id" element={<ProtectedRoute element={<RequestDetails />} roleRequired="bureau" />} />
                    <Route path="rapport/:id" element={<ProtectedRoute element={<Rapport />} roleRequired="bureau" />} />
                    <Route path="rapportfinal/:id" element={<ProtectedRoute element={<RapportFinal />} roleRequired="bureau" />} />
                    <Route path="GenerateRapport/:id" element={<ProtectedRoute element={<GenerateRapport />} roleRequired="bureau" />} />
                </Route>
                <Route path="/laboratoire" element={<LaboMainPage />}>
                    <Route index element={<Laboratoire />} />
                    <Route path="analyses/:selectedLabo" element={<AnalysisList />} /> {/* New route for AnalysisList */}
                    <Route path="analysis-details/:id" element={<AnalysisDetails />} />
                </Route>
                <Route path="/admin" element={<ProtectedRoute element={<AdminMainPage />} roleRequired="admin" />}>
                    <Route index element={<ProtectedRoute element={<AdminPanel />} roleRequired="admin" />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default App;
