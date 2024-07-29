import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate, Outlet } from 'react-router-dom';
import "./FinanceMainPage.css";

const MainPage = () => {
    const navigate = useNavigate();

    return (
        <div>
            <AppBar position="static">
                <Toolbar className="main-page-container-finance">
                    {/* <Typography variant="h6" className="main-page-title-finance">
                        Finance
                    </Typography> */}
                    <Button color="inherit" variant="h6" className="main-page-title-reception" onClick={() => navigate('/')} className="main-button-reception">
                        Finance
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/finance/NouvellesDemandes')} className="main-button-finance">
                        Nouvelles demandes
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
