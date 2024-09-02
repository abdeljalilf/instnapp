import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminPanel.css';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ email: '', password: '', role: '', department: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editUserId, setEditUserId] = useState(null);
    const [resetPassword, setResetPassword] = useState(false); // New state for reset password checkbox
    const [errorMessage, setErrorMessage] = useState(''); // State for error message
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const apiUrl = `${apiBaseUrl}/instnapp/backend/routes/admin`;
    const session_id = localStorage.getItem('session_id');
    const navigate = useNavigate();
    const [hoveredRow, setHoveredRow] = useState({ id: null, action: '' });

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Vérifiez si l'email est déjà utilisé
        const emailExists = users.some(user => user.email === form.email);
        if (emailExists && !isEditing) {
            setErrorMessage('Cette adresse e-mail est déjà utilisée. Veuillez en choisir une autre.');
            return;
        }

        setErrorMessage(''); // Réinitialiser le message d'erreur

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
            setResetPassword(false); // Réinitialiser l'état de la case à cocher
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
            <form className="admin-form" onSubmit={handleSubmit}>
                {!isEditing && 
                (<>
                    <div className='edit-users-label'>
                        <h3>Ajouter un utilisateur</h3>
                    </div>
                </>)}
                {isEditing && 
                (<>
                    <div className='edit-users-label'>
                        <h3>Editer un utilisateur</h3>
                    </div>
                </>)}
                <label>Email:</label>
                <input type="email" name="email" value={form.email} onChange={handleInputChange} placeholder="Email" required />
                
                {/* Afficher le message d'erreur ici */}
                {errorMessage && <div className="error-message">{errorMessage}</div>}

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
                        <th>Modifier</th>
                        <th>Supprimer</th>
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
                                </td>
                                <td>
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
