import React from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import { FaFlask, FaUniversity, FaArchive } from 'react-icons/fa'; // Import the icons
import './Dashboard.css';

const Dashboard = () => {
    const { department } = useParams();

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <ul>
                    <li>
                        <NavLink 
                            to={department} 
                            className={({ isActive }) => (isActive ? 'active' : '')} 
                            data-tooltip="Department"
                        >
                            <FaFlask className="icon" />
                            <span>{department}</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="instn" 
                            className={({ isActive }) => (isActive ? 'active' : '')} 
                            data-tooltip="INSTN"
                        >
                            <FaUniversity className="icon" />
                            <span>INSTN</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="archive" 
                            className={({ isActive }) => (isActive ? 'active' : '')} 
                            data-tooltip="Archive"
                        >
                            <FaArchive className="icon" />
                            <span>Archive</span>
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
