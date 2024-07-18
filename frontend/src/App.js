import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Importez votre fichier CSS personnalisé
import UserForm from './components/UserForm/UserForm';
import DemandesList from './components/DemandeList/DemandesList';
function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container">
            <NavLink className="navbar-brand" to="/">INSTN</NavLink>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav mx-auto">
                <li className="nav-item">
                  <NavLink className="nav-link" to="/userform" activeClassName="active">UserForm</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/demandes" activeClassName="active">DemandesList</NavLink>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/userform" element={<UserForm />} />
          <Route path="/demandes" element={<DemandesList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
