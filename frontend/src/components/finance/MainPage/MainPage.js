import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate, Outlet } from 'react-router-dom';
import "./MainPage.css";

const MainPage = () => {
    const navigate = useNavigate();

    return (
        <div>
            <AppBar position="static">
                <Toolbar className="main-page-container">
                    <Typography variant="h6" className="main-page-title">
                        Finance
                    </Typography>
                    <Button color="inherit" onClick={() => navigate('/reception')} className="main-button">
                        Faire une nouvelle demande
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/reception/requests-details')} className="main-button">
                        Les détails sur les demandes
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
