import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import TaskCardView from './TaskCardView';
import SprintModal from './SprintModal';
import TaskCardDetails from './TaskCardDetails';
import './SprintDetails.css';

const SprintDetails = ({ sprint, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentSprint, setCurrentSprint] = useState(sprint);
  const [selectedTask, setSelectedTask] = useState(null);

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

  const isSprintEditable = currentSprint.status !== 'Active' && currentSprint.status !== 'Completed';

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleTaskClose = () => {
    setSelectedTask(null);
  };

  const handleTaskSave = (updatedTask) => {
    const updatedTasks = currentSprint.tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    const updatedSprint = { ...currentSprint, tasks: updatedTasks };
    setCurrentSprint(updatedSprint);
    onUpdate(updatedSprint);
    setSelectedTask(null);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content sprint-details-modal">
        <h2>{currentSprint.name}</h2>
        <p>Start Date: {currentSprint.startDate}</p>
        <p>End Date: {currentSprint.endDate}</p>
        <p>Status: {currentSprint.status}</p>
        {isSprintEditable && (
          <button className="edit-sprint-button" onClick={handleEditClick}>Edit Sprint</button>
        )}
        <h3 className="tasks-heading">Tasks</h3>
        <div className="task-grid">
          {currentSprint.tasks && currentSprint.tasks.map(task => (
            <div key={task.id} onClick={() => handleTaskClick(task)}>
              <TaskCardView task={task} />
            </div>
          ))}
        </div>
        <div className="modal-actions">
          {isSprintEditable && (
            <Link to={`/sprint/${currentSprint.id}/backlog`} className="edit-sprint-link">
              Edit Backlog
            </Link>
          )}
          <button onClick={onClose}>Close</button>
        </div>
      </div>
      {isEditing && isSprintEditable && (
        <SprintModal
          sprint={currentSprint}
          onSave={handleSave}
          onClose={handleCancel}
          isEditing={true}
        />
      )}
      {selectedTask && (
        <TaskCardDetails
          task={selectedTask}
          onSave={handleTaskSave}
          onClose={handleTaskClose}
          readOnly={true}
        />
      )}
    </div>
  );
};

export default SprintDetails;