import { AppBar, Toolbar, Button } from '@mui/material';
import { useNavigate, useParams, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import instnlogo from '../../../images/INSTN-logo.png';
import logoutIcon from '../../../images/logout.png';
import changePasswordIcon from '../../../images/changePassword.png';
import menuIcon from '../../../images/menu.png';
import "./LaboratoryMainPage.css";

const LaboratoryMainPage = () => {
    const navigate = useNavigate();
    const { department } = useParams(); // Extract department from URL
    const location = useLocation(); // Get the current location
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const session_id = localStorage.getItem('session_id');
    const [menuOpen, setMenuOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [activeSection, setActiveSection] = useState(location.pathname); // Track active section

    useEffect(() => {
        setActiveSection(location.pathname); // Update active section on route change
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await axios.post(`${apiBaseUrl}/instnapp/backend/routes/login/logout.php`, {}, {
                headers: {
                    Authorization: session_id
                }
            });
            localStorage.removeItem('session_id');
            localStorage.removeItem('user_email');
            navigate('/login'); // Redirect to login page
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleChangePassword = () => {
        navigate('/changePassword');
    };

    const toggleMenu = () => {
        setMenuOpen(prevMenuOpen => !prevMenuOpen);
    };

    const refreshPage = () => {
        window.location.reload();
    };

    useEffect(() => {
        const storedEmail = localStorage.getItem('user_email');
        if (storedEmail) {
            setEmail(storedEmail);
        } else {
            axios.get(`${apiBaseUrl}/instnapp/backend/routes/login/userinfo.php`, {
                headers: {
                    Authorization: session_id
                }
            })
            .then(response => {
                setEmail(response.data.email);
                localStorage.setItem('user_email', response.data.email); // Store email locally
            })
            .catch(error => {
                console.error('Error fetching user info:', error);
            });
        }
    }, [session_id, apiBaseUrl]);

    // Function to determine if a route is active
    const isActive = (path) => location.pathname === path;

    return (
        <div>
            <AppBar position="static" className="app-bar">
                <Toolbar className="main-page-container-bureau">
                    <div className='instn-logo-bureau' onClick={refreshPage}>
                        <img src={instnlogo} alt="INSTN Logo" />
                        <p> Bonjour: <span onClick={refreshPage}>{email}</span> </p>
                    </div>
                    <Button 
                        color="inherit"
                        onClick={() => navigate(`/bureau/${department}/new-requests`)}
                        className={`main-button-bureau ${activeSection === `/bureau/${department}/new-requests` ? 'active' : ''}`}
                    >
                        Les nouvelles demandes
                    </Button>
                    <Button 
                        color="inherit"
                        onClick={() => navigate(`/bureau/${department}/processed-requests`)}
                        className={`main-button-bureau ${activeSection === `/bureau/${department}/processed-requests` ? 'active' : ''}`}
                    >
                        Les nouveaux résultats
                    </Button>
                    <Button 
                        color="inherit" 
                        onClick={() => navigate(`/bureau/${department}/dashboard`)}
                        className={`main-button-bureau
                             ${activeSection === `/bureau/${department}/dashboard` ? 'active' : ''}`}
                    >
                        Dashboard et Archive
                    </Button>
                    <button onClick={toggleMenu} className={`menu-button ${menuOpen ? 'show' : ''}`}>
                        <img src={menuIcon} alt="Menu icon" />
                    </button>
                </Toolbar>
            </AppBar>
            <div className={`overlay ${menuOpen ? 'show' : ''}`}></div>
            <div className={`dropdown-menu-bureau ${menuOpen ? 'show' : ''}`}>
                <button onClick={handleLogout} className="logout-button"> 
                    Logout 
                    <img src={logoutIcon} alt="Logout icon" />
                </button>
                <button onClick={handleChangePassword} className="change-password-button"> 
                    Changer mot de passe
                    <img src={changePasswordIcon} alt="Change password icon" />
                </button>
            </div>
            <div className="bureau-main-page-content">
                <Outlet /> {/* Display child routes here */}
            </div>
        </div>
    );
};

export default LaboratoryMainPage;
