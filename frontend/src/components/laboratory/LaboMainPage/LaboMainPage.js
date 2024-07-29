import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate, Outlet } from 'react-router-dom';
import "./LaboMainPage.css";

const LaboMainPage = () => {
    const navigate = useNavigate();

    return (
        <div>
            <AppBar position="static">
                <Toolbar className="main-page-container-finance">
                    {/* <Typography variant="h6" className="main-page-title-finance">
                        Finance
                    </Typography> */}
                    <Button color="inherit" variant="h6" className="main-page-title-reception" onClick={() => navigate('/')} >
                        Laboratoire
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/loboratoire')} className="main-button-finance">
                        Laboratoire
                    </Button>
                </Toolbar>
            </AppBar>
            <div>
                <Outlet /> {/* Afficher les enfants des routes ici */}
            </div>
        </div>
    );
};

export default LaboMainPage;
