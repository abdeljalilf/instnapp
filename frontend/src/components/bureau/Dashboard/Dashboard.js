// src/components/bureau/Dashboard/Dashboard.js

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <ul>
                    <li>
                        <NavLink 
                            to="department" 
                            className={({ isActive }) => (isActive ? 'active' : '')} 
                            data-tooltip="Department"
                        >
                            Department
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="instn" 
                            className={({ isActive }) => (isActive ? 'active' : '')} 
                            data-tooltip="INSTN"
                        >
                            INSTN
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="archive" 
                            className={({ isActive }) => (isActive ? 'active' : '')} 
                            data-tooltip="dashboard/Archive"
                        >
                            Archive
                        </NavLink>
                    </li>
                </ul>
            </div>
            <div className="content">
                <Outlet />
            </div>
        </div>
    );
};

export default Dashboard;
