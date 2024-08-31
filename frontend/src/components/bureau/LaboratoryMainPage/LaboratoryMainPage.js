import React from 'react';
import { AppBar, Toolbar, Button } from '@mui/material';
import { useNavigate, useParams, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import "./LaboratoryMainPage.css";

const LaboratoryMainPage = () => {
    const navigate = useNavigate();
    const { department } = useParams(); // Extract department from URL
    const location = useLocation(); // Get the current location
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
            navigate('/login'); // Redirect to login page
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
                <div className="title">
                    <h2>Bureau {department} </h2>
                </div>
                    <Button 
                        className={`nav-button ${isActive(`/bureau/${department}/new-requests`) ? 'active' : 'inactive'}`}
                        onClick={() => navigate(`/bureau/${department}/new-requests`)}
                    >
                        Les nouvelles demandes
                    </Button>
                    <Button 
                        className={`nav-button ${isActive(`/bureau/${department}/processed-requests`) ? 'active' : 'inactive'}`}
                        onClick={() => navigate(`/bureau/${department}/processed-requests`)}
                    >
                        Les nouveaux résultats
                    </Button>
                    <Button 
                        className={`nav-button ${isActive(`/bureau/${department}/dashboard`) ? 'active' : 'inactive'}`}
                        onClick={() => navigate(`/bureau/${department}/dashboard`)}
                    >
                        Dashboard et Archive
                    </Button>
                    <Button 
                        className="nav-button bureau-logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>
            <div className="bureau-main-page-content">
                <Outlet /> {/* Display child routes here */}
            </div>
        </div>
    );
};

export default LaboratoryMainPage;
