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
  const navigate = useNavigate();

  useEffect(() => {
    const storedSprints = JSON.parse(localStorage.getItem('sprints')) || [];
    setSprints(storedSprints);
  }, []);

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
  };

  const handleSprintClick = (sprint) => {
    setSelectedSprint(sprint);
    setShowSprintDetails(true);
  };

  const handleCloseSprintDetails = () => {
    setShowSprintDetails(false);
    setSelectedSprint(null);
  };

  return (
    <div className="sprint-board">
      <header className="page-header">
        <h1>Sprint Board</h1>
        <button className="create-sprint-btn" onClick={() => setShowCreateModal(true)}>
          + Create Sprint
        </button>
      </header>
      <table className="sprint-table">
        <thead>
          <tr>
            <th>Sprint</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sprints.map((sprint) => (
            <tr key={sprint.id} onClick={() => handleSprintClick(sprint)}>
              <td>{sprint.name}</td>
              <td>{sprint.startDate}</td>
              <td>{sprint.endDate}</td>
              <td>{sprint.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
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