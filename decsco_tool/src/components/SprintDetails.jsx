import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import TaskCardView from './TaskCardView';
import SprintModal from './SprintModal';
import './SprintDetails.css';

const SprintDetails = ({ sprint, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentSprint, setCurrentSprint] = useState(sprint);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = (updatedSprint) => {
    setCurrentSprint(updatedSprint);
    onUpdate(updatedSprint);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content sprint-details-modal">
        <h2>{currentSprint.name}</h2>
        <p>Start Date: {currentSprint.startDate}</p>
        <p>End Date: {currentSprint.endDate}</p>
        <p>Status: {currentSprint.status}</p>
        <button className="edit-sprint-button" onClick={handleEditClick}>Edit Sprint</button>
        <h3 className="tasks-heading">Tasks</h3>
        <div className="task-grid">
          {currentSprint.tasks && currentSprint.tasks.map(task => (
            <TaskCardView key={task.id} task={task} />
          ))}
        </div>
        <div className="modal-actions">
          <Link to={`/sprint/${currentSprint.id}/backlog`} className="edit-sprint-link">
            Edit Backlog
          </Link>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
      {isEditing && (
        <SprintModal
          sprint={currentSprint}
          onSave={handleSave}
          onClose={handleCancel}
          isEditing={true}
        />
      )}
    </div>
  );
};

export default SprintDetails;