import React, { useState } from 'react';
import { AppBar, Toolbar, Button } from '@mui/material';
import { useNavigate, useParams, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import logoutIcon from '../../../images/logout.png';
import changePasswordIcon from '../../../images/changePassword.png';  
import menuIcon from '../../../images/menu.png';    
import './LaboMainPage.css';

const LaboMainPage = () => {
    const navigate = useNavigate();
    const { departement } = useParams(); // Extract department from URL
    const location = useLocation();
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const session_id = localStorage.getItem('session_id');
    const [menuOpen, setMenuOpen] = useState(false);

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

    const handleChangePassword = () => {
        // Navigate to change password page or handle change password logic here
        navigate('/change-password');
    };

    const toggleMenu = () => setMenuOpen(!menuOpen);

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
                    <button onClick={toggleMenu} className={`menu-button ${menuOpen ? 'show' : ''}`}>
                        <img src={menuIcon} alt="Menu icon" /> {/* Your menu icon */}
                    </button>
                </Toolbar>
            </AppBar>
            <div className={`overlay ${menuOpen ? 'show' : ''}`}></div>
            <div className={`dropdown-menu-admin ${menuOpen ? 'show' : ''}`}>
                <button onClick={handleLogout} className="logout-button"> 
                    Logout 
                    <img src={logoutIcon} alt="Logout icon" />
                </button>
                <button onClick={handleChangePassword} className="change-password-button"> 
                    Changer mot de passe
                    <img src={changePasswordIcon} alt="Change password icon" />
                </button>
            </div>
            <div>
                <Outlet /> {/* Display child routes here */}
            </div>
        </div>
    );
};

export default LaboMainPage;
