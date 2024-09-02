import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button } from '@mui/material';
import { useNavigate, Outlet } from 'react-router-dom';
import instnlogo from '../../../images/INSTN-logo.png';
import logoutIcon from '../../../images/logout.png';
import changePasswordIcon from '../../../images/changePassword.png';
import menuIcon from '../../../images/menu.png'; // Add your menu icon here
import axios from 'axios';
import "./AdminMainPage.css";

const AdminMainPage = () => {
    const navigate = useNavigate();
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const session_id = localStorage.getItem('session_id');
    const [email, setEmail] = useState('');
    const [menuOpen, setMenuOpen] = useState(false); // State to manage menu visibility

    useEffect(() => {
        // Supposons que l'email est stocké dans localStorage
        const storedEmail = localStorage.getItem('user_email');
        if (storedEmail) {
            setEmail(storedEmail);
        } else {
            // Si l'email n'est pas dans le stockage local, vous pouvez faire une requête pour l'obtenir
            // Exemple d'appel API pour récupérer l'email de l'utilisateur
            axios.get(`${apiBaseUrl}/instnapp/backend/routes/login/userinfo.php`, {
                headers: {
                    Authorization: session_id
                }
            })
            .then(response => {
                setEmail(response.data.email);
                localStorage.setItem('user_email', response.data.email); // Stocker l'email localement
            })
            .catch(error => {
                console.error('Error fetching user info:', error);
            });
        }
    }, [session_id, apiBaseUrl]);

    const handleLogout = async () => {
        try {
            await axios.post(`${apiBaseUrl}/instnapp/backend/routes/login/logout.php`, {}, {
                headers: {
                    Authorization: session_id
                }
            });
            localStorage.removeItem('session_id');
            localStorage.removeItem('user_email');
            navigate('/login'); // Rediriger vers la page de connexion
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
    
    return (
        <div>
            <AppBar position="static">
                <Toolbar className="main-page-container-admin">
                    <div className='instn-logo-admin' onClick={refreshPage}> {/* Add onClick here */}
                        <img src={instnlogo} alt="INSTN Logo" />
                        <p> Bonjour: <span onClick={refreshPage}>{email}</span> </p> {/* Add onClick here */}
                    </div>
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
                <Outlet /> {/* Afficher les enfants des routes ici */}
            </div>
        </div>
    );
    
};

export default AdminMainPage;
