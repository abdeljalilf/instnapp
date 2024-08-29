// src/components/laboratory/Laboratoire.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Laboratoire.css';

const Laboratoire = () => {
  const departments = ['TFXE', 'ATN', 'HI'];
  const [department, setSelecteddepartment] = useState('');
  const navigate = useNavigate();

  const handledepartmentChange = (event) => {
    const department = event.target.value;
    setSelecteddepartment(department);
    navigate(`/laboratoire/analyses/${department}`);
  };

  return (
    <div className="labo-container">
      <div className="labo-header">
        <h1>Select department</h1>
      </div>
      <div className="labo-select-group">
        <select value={department} onChange={handledepartmentChange} className="labo-select">
          <option value="" disabled>Select a department</option>
          {departments.map(department => (
            <option key={department} value={department}>{department}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Laboratoire;
