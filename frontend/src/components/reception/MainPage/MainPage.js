import React from 'react';
import { AppBar, Toolbar, Button, Typography } from '@mui/material';
import { useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import './MainPage.css';

const MainPage = () => {
    const navigate = useNavigate();
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const session_id = localStorage.getItem('session_id');

    const handleLogout = async () => {
        try {
            await axios.post(`${apiBaseUrl}/instnapp/backend/routes/login/logout.php`, {}, {
                headers: {
                    Authorization: session_id
                }
            });
            localStorage.removeItem('session_id');
            navigate('/login'); // Rediriger vers la page de connexion
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div>
            <AppBar position="static">
                <Toolbar className="main-page-container-reception">
                    <Button color="inherit" variant="h6" onClick={() => navigate('/')} className="main-button-reception">
                        Accueil
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/reception/Statistiques')} className="main-button-reception">
                        Statistiques
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/reception/DemandesForm')} className="main-button-reception">
                        Faire une nouvelle demande
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/reception/DemandesList')} className="main-button-reception">
                        Les détails sur les demandes
                    </Button>
                    <Button color="inherit" onClick={handleLogout} className="logout-button">
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>
            <div>
                <Outlet /> {/* Afficher les enfants des routes ici */}
            </div>
        </div>
    );
};

export default MainPage;
