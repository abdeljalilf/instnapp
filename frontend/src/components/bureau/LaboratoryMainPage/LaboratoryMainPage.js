import React from 'react';
import { AppBar, Toolbar, Button } from '@mui/material';
import { useNavigate, useParams, Outlet } from 'react-router-dom';
import "./LaboratoryMainPage.css";

const LaboratoryMainPage = () => {
    const navigate = useNavigate();
    const { department } = useParams(); // Extract department from URL

    return (
        <div>
            <AppBar position="static" sx={{ backgroundColor: '#2e8b57' }}>
                <Toolbar>
                    <Button variant="h6" sx={{ flexGrow: 1 }} onClick={() => navigate('/')}>Bureau {department}</Button>
                    <Button variant="h6" sx={{ flexGrow: 1 }} onClick={() => navigate('/bureau')}>Choisir le department </Button>
                    <Button color="inherit" onClick={() => navigate(`/bureau/${department}/new-requests`)}>Les nouvelles demandes</Button>
                    <Button color="inherit" onClick={() => navigate(`/bureau/${department}/processed-requests`)}>Les nouveaux résultats</Button>
                    <Button color="inherit" onClick={() => navigate(`/bureau/${department}/dashboard`)}>Dashboard et Statistiques</Button>
                    <Button color="inherit" onClick={() => navigate(`/bureau/${department}/Archeif`)}>Archeif</Button>

                </Toolbar>
            </AppBar>
            <div className="content">
                <Outlet /> {/* Display child routes here */}
            </div>
        </div>
    );
};

export default LaboratoryMainPage;
