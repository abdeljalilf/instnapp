import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Ensure this file exists for styling
import instnlogo from '../../images/INSTN-logo.png';
import instnbackground from '../../images/INSTN-background.JPG';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${apiBaseUrl}/instnapp/backend/routes/login/login.php`, {
                email,
                password,
            });
            if (response.data.success) {
                const { redirectUrl, session_id } = response.data;
                localStorage.setItem('session_id', session_id);
                // Check if the password is the default password
                if (password === 'instn') {
                    navigate('/changePassword'); // Redirect to change password page
                } else {
                    navigate(redirectUrl);// Redirect to the page based on user role
                }
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('An error occurred. Please try again.');
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div>
            <div className='instn-background'>
                <img src={instnbackground} alt="INSTN Background" />
            </div>
            <div className="login-container">
                <h2>Login</h2>
                <div className='instn-logo'>
                    <img src={instnlogo} alt="INSTN Logo" />
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <FontAwesomeIcon
                                icon={showPassword ? faEyeSlash : faEye}
                                onClick={toggleShowPassword}
                                className="password-toggle-icon"
                            />
                        </div>
                    </div>
                    {error && <div className="error">{error}</div>}
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
