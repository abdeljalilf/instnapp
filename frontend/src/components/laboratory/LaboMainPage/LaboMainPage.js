import React from 'react';
import { AppBar, Toolbar, Button } from '@mui/material';
import { useNavigate, useParams, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import './LaboMainPage.css';

const LaboMainPage = () => {
    const navigate = useNavigate();
    const { departement } = useParams(); // Extract department from URL
    const location = useLocation();
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
            navigate('/login'); // Redirect to login page after logout
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    // Function to determine if a route is active
    const isActive = (path) => location.pathname === path;

    return (
        <div>
            <AppBar position="static" className="app-bar">
                <Toolbar>
                    <Button 
                        color="inherit" 
                        className="main-page-title-reception" 
                        onClick={() => navigate(`/laboratoire/${departement}`)}
                    >
                        Laboratoire {departement}
                    </Button>
                    <Button 
                        className={`nav-button ${isActive(`/laboratoire/${departement}/new-analysis`) ? 'active' : 'inactive'}`} 
                        onClick={() => navigate(`/laboratoire/${departement}/new-analysis`)}
                    >
                        Nouvelles analyses
                    </Button>
                    <Button 
                        className="nav-button labo-logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>
            <div>
                <Outlet /> {/* Display child routes here */}
            </div>
        </div>
    );
};

export default LaboMainPage;
