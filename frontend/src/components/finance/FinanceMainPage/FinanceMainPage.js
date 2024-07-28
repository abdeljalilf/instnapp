import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate, Outlet } from 'react-router-dom';
import "./FinanceMainPage.css";

const MainPage = () => {
    const navigate = useNavigate();

    return (
        <div>
            <AppBar position="static">
                <Toolbar className="main-page-container">
                    <Typography variant="h6" className="main-page-title">
                        Finance
                    </Typography>
                    <Button color="inherit" onClick={() => navigate('/finance/NouvellesDemandes')} className="main-button">
                        Nouvelles demandes
                    </Button>
                </Toolbar>
            </AppBar>
            <div className="content">
                <Outlet /> {/* Afficher les enfants des routes ici */}
            </div>
        </div>
    );
};

export default MainPage;
