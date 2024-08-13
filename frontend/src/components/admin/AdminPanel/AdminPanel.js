import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Button } from '@mui/material';
import axios from 'axios';
import './AdminPanel.css';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ email: '', password: '', role: '', department: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editUserId, setEditUserId] = useState(null);
    const [resetPassword, setResetPassword] = useState(false); // New state for reset password checkbox
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const apiUrl = `${apiBaseUrl}/instnapp/backend/routes/admin`;
    const session_id = localStorage.getItem('session_id');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${apiUrl}/get_users.php`, {
                headers: {
                    Authorization: session_id
                }
            });
            if (Array.isArray(response.data)) {
                setUsers(response.data);
            } else {
                console.error('Unexpected response format:', response.data);
                setUsers([]);
            }
        } catch (error) {
            console.error('Error fetching users:', error.response ? error.response.data : error.message);
            setUsers([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleCheckboxChange = () => {
        setResetPassword(!resetPassword);
        if (!resetPassword) {
            setForm({ ...form, password: 'instn' }); // Set password to "instn" if checkbox is checked
        } else {
            setForm({ ...form, password: '' }); // Clear password if checkbox is unchecked
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post(`${apiBaseUrl}/instnapp/backend/routes/login/logout.php`, {}, {
                headers: {
                    Authorization: session_id
                }
            });
            localStorage.removeItem('session_id');
            navigate('/login'); // Rediriger vers la page de connexion
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.post(`${apiUrl}/update_user.php`, { ...form, id: editUserId }, {
                    headers: {
                        Authorization: session_id
                    }
                });
            } else {
                await axios.post(`${apiUrl}/create_user.php`, form, {
                    headers: {
                        Authorization: session_id
                    }
                });
            }
            fetchUsers();
            setForm({ email: '', password: '', role: '', department: '' });
            setIsEditing(false);
            setResetPassword(false); // Reset checkbox state
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleEdit = (user) => {
        setForm({ email: user.email, password: '', role: user.role, department: user.department || '' });
        setIsEditing(true);
        setEditUserId(user.id);
        scrollToTop();
    };

    const handleChangePassword = () => {
        navigate('/changePassword');
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(`Est-ce que vous confirmer la supression?`);
        if (confirmDelete) {
            try {
                await axios.post(`${apiUrl}/delete_user.php`, { id }, {
                    headers: {
                        Authorization: session_id
                    }
                });
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="admin-panel">
            <h2 className="form-header">
            Admin 
            <Button color="inherit" onClick={handleLogout} className="logout-button"> Logout
                <i className="bi bi-box-arrow-right"></i> {/* Bootstrap logout icon */}
            </Button>
            <Button color="inherit" onClick={handleChangePassword} className="change-password-button"> Changer mot de passe
                <i className="bi bi-lock"></i> {/* Bootstrap lock icon */}
            </Button>
             </h2>
            <form className="admin-form" onSubmit={handleSubmit}>
                <label>Email:</label>
                <input type="email" name="email" value={form.email} onChange={handleInputChange} placeholder="Email" required />
                
                {/* Checkbox for resetting password */}
                {isEditing && (
                    <>
                      <div className='checkbox-container'>
                        <label>
                            Réinitialiser le mot de passe :
                        </label>
                        <input 
                            type="checkbox" 
                            className='checkbox-input'
                            checked={resetPassword} 
                            onChange={handleCheckboxChange}
                        />
                    </div>

                    </>
                )}

                <label>Role:</label>
                <select name="role" value={form.role} onChange={handleInputChange} required>
                    <option value="">Sélectionner un role</option>
                    <option value="reception">Reception</option>
                    <option value="finance">Finance</option>
                    <option value="laboratoire">Laboratoire</option>
                    <option value="bureau">Bureau</option>
                    <option value="admin">Admin</option>
                </select>

                {/* Show department field only if role is not admin, finance, or reception */}
                {form.role !== 'admin' && form.role !== 'finance' && form.role !== 'reception' && (
                    <>
                        <label>Departement:</label>
                        <select name="department" value={form.department} onChange={handleInputChange}>
                            <option value="">Sélectionner un department</option>
                            <option value="TFXE">TFXE</option>
                            <option value="ATN">ATN</option>
                            <option value="HI">HI</option>
                        </select>
                    </>
                )}
                <div className='button-container'>
                    <button className="details-button-admin" type="submit">{isEditing ? 'Editer utilisateur' : 'Ajouter utilisateur'}</button>
                </div>
            </form>

            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(users) && users.length > 0 ? (
                        users.map(user => (
                            <tr key={user.id}>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>{user.department || 'N/A'}</td>
                                <td className='button-container'>
                                    <button className='button-admin-edit' onClick={() => handleEdit(user)}>Modifier</button>
                                    <button className='button-admin-delete' onClick={() => handleDelete(user.id)}>Supprimer</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">No users found {users.length}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminPanel;
