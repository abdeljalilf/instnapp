import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import "./LaboratoryMainPage.css";

const LaboratoryMainPage = () => {
    const navigate = useNavigate();

    return (
        <div>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Bureau TFXE
                    </Typography>
                    <Button color="inherit" onClick={() => navigate('/bureau/new-requests')}>Les nouvelles demandes</Button>
                    <Button color="inherit" onClick={() => navigate('/bureau/processed-requests')}>Les nouveaux résultats</Button>
                    <Button color="inherit" onClick={() => navigate('/bureau/dashboard')}>Dashboard et Statistiques</Button>
                </Toolbar>
            </AppBar>
            <div className="content">
                <Outlet /> {/* Afficher les enfants des routes ici */}
            </div>
        </div>
    );
};

export default LaboratoryMainPage;
