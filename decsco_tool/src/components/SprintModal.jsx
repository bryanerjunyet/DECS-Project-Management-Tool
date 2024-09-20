import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './SprintModal.css';

const SprintModal = ({ sprint, onSave, onClose, isEditing = false }) => {
  const [sprintName, setSprintName] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditing && sprint) {
      setSprintName(sprint.name);
      setStartDate(new Date(sprint.startDate));
      setEndDate(new Date(sprint.endDate));
    }
  }, [isEditing, sprint]);

  const handleSave = () => {
    const updatedSprint = {
      ...(isEditing ? sprint : { id: Date.now().toString() }),
      name: sprintName,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: isEditing ? sprint.status : 'Not started',
      tasks: isEditing ? sprint.tasks : []
    };
  
    onSave(updatedSprint);
    onClose();
  
    if (!isEditing) {
      navigate(`/sprint/${updatedSprint.id}/backlog`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{isEditing ? 'Edit Sprint' : 'Create Sprint'}</h2>
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
          <button onClick={handleSave}>{isEditing ? 'Update Sprint' : 'Save Sprint'}</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default SprintModal;