import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ element: Component, roleRequired, departmentRequired, ...rest }) => {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [loading, setLoading] = useState(true);
    const session_id = localStorage.getItem('session_id');
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        const checkAuthorization = async () => {
            if (!session_id) {
                setIsAuthorized(false);
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${apiBaseUrl}/instnapp/backend/routes/login/session_check.php`, {
                    headers: {
                        Authorization: session_id,
                    },
                });
                const { logged_in, user } = response.data;
                const { role, department } = user;

                if (logged_in && role === roleRequired && (!departmentRequired || department === departmentRequired)) {
                    setIsAuthorized(true);
                } else {
                    setIsAuthorized(false);
                }
            } catch (error) {
                console.error('Error checking session:', error);
                setIsAuthorized(false);
            }

            setLoading(false);
        };

        checkAuthorization();
    }, [session_id, roleRequired, departmentRequired]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return isAuthorized ? Component : <Navigate to="/login" />;
};

export default ProtectedRoute;
