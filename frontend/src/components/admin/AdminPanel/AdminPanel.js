import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminPanel.css';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ email: '', password: '', role: '', department: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editUserId, setEditUserId] = useState(null);
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const apiUrl = `${apiBaseUrl}/instnapp/backend/routes/admin`;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${apiUrl}/get_users.php`);
            console.log('Fetched users:', response.data);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.post(`${apiUrl}/update_user.php`, { ...form, id: editUserId });
            } else {
                await axios.post(`${apiUrl}/create_user.php`, form);
            }
            fetchUsers();
            setForm({ email: '', password: '', role: '', department: '' });
            setIsEditing(false);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleEdit = (user) => {
        setForm({ email: user.email, password: '', role: user.role, department: user.department || '' });
        setIsEditing(true);
        setEditUserId(user.id);
    };

    const handleDelete = async (id) => {
        try {
            await axios.post(`${apiUrl}/delete_user.php`, { id });
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    return (
        <div className="admin-panel">
            <h2 className="form-header">Admin Panel</h2>
            <form className="admin-form" onSubmit={handleSubmit}>
                <label>Email:</label>
                <input type="email" name="email" value={form.email} onChange={handleInputChange} placeholder="Email" required />
                
                {/* Show password field only when editing */}
                {isEditing && (
                    <>
                        <label>Mot de passe:</label>
                        <input type="password" name="password" value={form.password} onChange={handleInputChange} placeholder="Password" />
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
                
                <button className="details-button-admin" type="submit">{isEditing ? 'Update User' : 'Add User'}</button>
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
                                <td>
                                    <button onClick={() => handleEdit(user)}>Edit</button>
                                    <button onClick={() => handleDelete(user.id)}>Delete</button>
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
