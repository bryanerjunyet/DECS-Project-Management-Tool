import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './SprintModal.css';

const SprintModal = ({ onSave, onClose }) => {
  const [sprintName, setSprintName] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handleSave = () => {
    const newSprint = {
      id: Date.now().toString(),
      name: sprintName,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: 'Not started',
      tasks: []
    };
    onSave(newSprint);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create Sprint</h2>
        <input
          type="text"
          className="sprint-name"
          placeholder="Enter Sprint Name"
          value={sprintName}
          onChange={(e) => setSprintName(e.target.value)}
        />
        <div className="date-picker-container">
          <label>Start Date:</label>
          <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
        </div>
        <div className="date-picker-container">
          <label>End Date:</label>
          <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} />
        </div>
        <div className="modal-actions">
          <button onClick={handleSave}>Save Sprint</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default SprintModal;