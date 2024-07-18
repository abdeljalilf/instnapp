import React from 'react';
import UserForm from './components/UserForm';
import './App.css';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>Formulaire de soumission d'échantillons</h1>
            </header>
            <UserForm />
        </div>
    );
}

export default App;
/*
import React, { useState } from 'react';
import UserForm from './components/formclient/UserForm';
import Login from './components/Login';
import RequestsList from './components/reception/RequestsList';
import CreateRequest from './components/reception/CreateRequest';

const App = () => {
    const [role, setRole] = useState(null);

    const handleLogin = (userRole) => {
        setRole(userRole);
    };

    const handleLogout = async () => {
        await fetch('http://localhost:3000/backend/auth.php?action=logout', {
            method: 'POST'
        });
        setRole(null);
    };

    return (
        <div>
            {role ? (
                <>
                    <button onClick={handleLogout}>Déconnexion</button>
                    {role === 'reception' && <RequestsList />}
                    {role === 'admin' && <CreateRequest />}
                </>
            ) : (
                <Login onLogin={handleLogin} />
            )}
        </div>
    );
};

export default App;

*/