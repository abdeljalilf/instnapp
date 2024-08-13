import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Use the same styling file
import instnlogo from '../../images/INSTN-logo.png'; // Reuse logo
import instnbackground from '../../images/INSTN-background.JPG'; // Reuse background image
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false); // Show/Hide old password
    const [showNewPassword, setShowNewPassword] = useState(false); // Show/Hide new password
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const session_id = localStorage.getItem('session_id');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${apiBaseUrl}/instnapp/backend/routes/login/change_password.php`, {
                oldPassword,
                newPassword,
                confirmPassword,
            }, {
                headers: {
                    Authorization: session_id,
                }
            });

            if (response.data.success) {
                setSuccess(response.data.message);
                setError(''); // Clear error if successful
                // Optionally redirect or clear fields
                navigate('/login')
            } else {
                setError(response.data.message);
                setSuccess(''); // Clear success message if there's an error
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
            setSuccess(''); // Clear success message if there's an error
        }
    };

    const toggleShowOldPassword = () => {
        setShowOldPassword(!showOldPassword);
    };

    const toggleShowNewPassword = () => {
        setShowNewPassword(!showNewPassword);
    };

    return (
        <div>
            <div className='instn-background'>
                <img src={instnbackground} alt="INSTN Background" />
            </div>
            <div className="login-container">
                <h2>Changer le mot de passe</h2>
                <div className='instn-logo'>
                    <img src={instnlogo} alt="INSTN Logo" />
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Ancien mot de passe:</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showOldPassword ? 'text' : 'password'}
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                            />
                            <FontAwesomeIcon
                                icon={showOldPassword ? faEyeSlash : faEye}
                                onClick={toggleShowOldPassword}
                                className="password-toggle-icon"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Nouveau mot de passe:</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <FontAwesomeIcon
                                icon={showNewPassword ? faEyeSlash : faEye}
                                onClick={toggleShowNewPassword}
                                className="password-toggle-icon"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Confirmer le nouveau mot de passe:</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}
                    <button type="submit">Confirmer</button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
