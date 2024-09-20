import React, { useState, useEffect } from 'react';
import './SprintTaskDetails.css';

const SprintTaskDetails = ({ task, onSave, onClose }) => {
  const [editedTask, setEditedTask] = useState(task);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prevTask => ({ ...prevTask, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedTask);
  };

  return (
    <div className="sprint-task-details-overlay">
      <div className="sprint-task-details">
        <h2>Sprint Task Details</h2>
        <form onSubmit={handleSubmit}>
          {/* Include all fields from TaskCardDetails */}
          {/* ... */}
          <div className="form-field">
            <label htmlFor="completionTime">Completion Time (minutes):</label>
            <input
              type="number"
              id="completionTime"
              name="completionTime"
              value={editedTask.completionTime || 0}
              onChange={handleChange}
              readOnly
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="save-task">Save Task</button>
            <button type="button" className="cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SprintTaskDetails;