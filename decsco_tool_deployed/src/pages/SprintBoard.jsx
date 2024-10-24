import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SprintModal from '../components/SprintModal';
import SprintDetails from '../components/SprintDetails';
import './SprintBoard.css';

const SprintBoard = () => {
  const [sprints, setSprints] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSprintDetails, setShowSprintDetails] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [showDeleteButtons, setShowDeleteButtons] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadSprints();
  }, []);

  const loadSprints = () => {
    const storedSprints = JSON.parse(localStorage.getItem('sprints')) || [];
    const today = new Date().toISOString().split('T')[0];
    console.log(storedSprints);
  
    // Check if there are any active sprints
    const hasActiveSprint = storedSprints.some(sprint => sprint.status === 'Active');
  
    const updatedSprints = storedSprints.map(sprint => {
      if (sprint.status !== 'Completed' && sprint.startDate <= today) {
        // Only set to Active if there are no other active sprints
        if (!hasActiveSprint) {
          return { ...sprint, status: 'Active' };
        }
      }
      return sprint;
    });
  
    setSprints(updatedSprints);
    updateLocalStorage(updatedSprints);
  };

  const updateLocalStorage = (updatedSprints) => {
    localStorage.setItem('sprints', JSON.stringify(updatedSprints));
  };

  const handleCreateSprint = (newSprint) => {
    const updatedSprints = [...sprints, newSprint];
    setSprints(updatedSprints);
    updateLocalStorage(updatedSprints);
    setShowCreateModal(false);
  };

  const handleUpdateSprint = (updatedSprint) => {
    const updatedSprints = sprints.map(sprint =>
      sprint.id === updatedSprint.id ? updatedSprint : sprint
    );
    setSprints(updatedSprints);
    updateLocalStorage(updatedSprints);
    setShowSprintDetails(false);
    setSelectedSprint(null);
  };

  const handleSprintClick = (sprint) => {
    setSelectedSprint(sprint);
    setShowSprintDetails(true);
  };

  const handleCloseSprintDetails = () => {
    setShowSprintDetails(false);
    setSelectedSprint(null);
  };

  const handleSprintAction = (sprint) => navigate(`/kanban-view/${sprint.id}`);

  const toggleDeleteButtons = () => {
    setShowDeleteButtons(!showDeleteButtons);
  };

  const handleDeleteSprint = (sprintId) => {
    const updatedSprints = sprints.filter(sprint => sprint.id !== sprintId);
    setSprints(updatedSprints);
    updateLocalStorage(updatedSprints);

    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = storedTasks.filter(task => task.sprintId !== sprintId);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#489848'; // Green
      case 'Active':
        return '#e3c93a'; // Yellow (using orange for better visibility)
      default:
        return '#348fb9'; // Black for any other status
    }
  };

  return (
    <div className="sprint-board">
      <header className="page-header">
        <h1>Sprint Board</h1>
        <button className="create-sprint-btn" onClick={() => setShowCreateModal(true)}>
          + Create Sprint
        </button>
      </header>
      <div className="sprint-table-container">
        <button className="delete-sprint-btn" onClick={toggleDeleteButtons}>
        </button>
        <table className="sprint-table">
          <thead>
            <tr>
              <th>Sprint</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sprints.map((sprint) => (
              <tr key={sprint.id}>
                <td onClick={() => handleSprintClick(sprint)}>{sprint.name}</td>
                <td>{sprint.startDate}</td>
                <td>{sprint.endDate}</td>
                <td style={{ backgroundColor: getStatusColor(sprint.status), color: 'white', fontWeight: 'bold' }}>
                  {sprint.status}
                </td>
                <td>
                  <button 
                    className={sprint.status === 'Active' || sprint.status === 'Completed' ? 'view-sprint-btn' : 'ready-sprint-btn'}
                    onClick={() => handleSprintAction(sprint)}
                  >
                    {sprint.status === 'Active' || sprint.status === 'Completed' ? 'VIEW SPRINT' : 'READY SPRINT'}
                  </button>
                  {showDeleteButtons && sprint.status === 'Completed' && (
                    <button className="delete-sprint-round-btn" onClick={() => handleDeleteSprint(sprint.id)}>
                      -
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showCreateModal && (
        <SprintModal
          onSave={handleCreateSprint}
          onClose={() => setShowCreateModal(false)}
        />
      )}
      {showSprintDetails && (
        <SprintDetails
          sprint={selectedSprint}
          onClose={handleCloseSprintDetails}
          onUpdate={handleUpdateSprint}
        />
      )}
    </div>
  );
};

export default SprintBoard;