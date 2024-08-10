import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import "./FinanceMainPage.css";

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
                <Toolbar className="main-page-container-finance">
                    {/* <Typography variant="h6" className="main-page-title-finance">
                        Finance
                    </Typography> */}
                    <Button color="inherit" variant="h6" className="main-page-title-reception main-button-reception" onClick={() => navigate('/')} >
                        Finance
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/finance/NouvellesDemandes')} className="main-button-finance">
                        Nouvelles demandes
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
