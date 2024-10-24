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

  const loadSprints = async() => {
    try {
      // Retrieve sprints from database
      const response = await fetch('http://localhost:3001/sprints', {
        method: 'GET'
      });

      // Sets current sprints to empty if there are no tasks
      if (response.status === 204) {
        setSprints([]);
        return;
      } else if (!response.ok) {
        throw new Error('Unable to retrieve sprints from database in Sprint Board.');
      }
      const jsonData = await response.json();

      const storedSprints = jsonData.rows;

      // Automatically updates the sprint status to match start and end date
      const today = new Date();
      for (const sprint of storedSprints) {
        const startDate = new Date(sprint.start_date);
        const endDate = new Date(sprint.end_date);
        if (sprint.sprintstatus_id === 1 && startDate <= today && today <= endDate) {
          await updateSprintStatus(sprint, 2); // Set to Active
        } else if (sprint.sprintstatus_id !== 3 && endDate < today) {
          await updateSprintStatus(sprint, 3); // Set to Completed
        }
      }

      setSprints(storedSprints);
    } catch (err) {
      console.error('Error fetching sprints:', err);
    }
  };

  const updateSprintStatus = async (sprint, status_id) => {
    try {
      const updateRes = await fetch('http://localhost:3001/sprints', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({sprint_id: sprint.sprint_id, sprintstatus_id: status_id}),
      });
      if (!updateRes.ok) {
        throw new Error(updateRes.message);
      }
      // Update the local state to reflect the change
      setSprints(prevSprints => 
        prevSprints.map(s => 
          s.sprint_id === sprint.sprint_id ? {...s, sprintstatus_id: status_id} : s
        )
      );
    } catch (err) {
      console.error('Error automatically updating sprint status:', err);
    }
  };

  const handleCreateSprint = async(newSprint) => {
    // Adds the sprint to the database
    try {
      const response = await fetch('http://localhost:3001/sprints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSprint),
      });

      if (!response.ok) {
        throw new Error(response.message);
      }

      if (!newSprint.isEditing) {
        const resData = await response.json();
        navigate(`/sprint/${resData.sprint_id}/backlog`);
      }
    } catch (err) {
      console.error('Failed to add new sprint:', err);
    }
    loadSprints();
    setShowCreateModal(false);
  };

  const handleUpdateSprint = (updatedSprint) => {
    loadSprints();
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

  const handleSprintAction = async (sprint) => {
    // Check and update sprint status before navigating
    const today = new Date();
    const startDate = new Date(sprint.start_date);
    const endDate = new Date(sprint.end_date);

    if (sprint.sprintstatus_id === 1 && startDate <= today && today <= endDate) {
      await updateSprintStatus(sprint, 2); // Set to Active
    } else if (sprint.sprintstatus_id !== 3 && endDate < today) {
      await updateSprintStatus(sprint, 3); // Set to Completed
    }

    navigate(`/kanban-view/${sprint.sprint_id}`);
  };

  const toggleDeleteButtons = () => {
    setShowDeleteButtons(!showDeleteButtons);
  };

  const handleDeleteSprint = async (sprintId) => {
    // Deletes sprint from database
    try {
      const response = await fetch(`http://localhost:3001/sprints?sprint_id=${sprintId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error('Failed to delete sprint:', err);
    }
    loadSprints();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 3:
        return '#489848'; // Green
      case 2:
        return '#e3c93a'; // Yellow (using orange for better visibility)
      default:
        return 'rgb(0, 140, 168)'; // Light blue for any other status
    }
  };

  return (
    <div className="sprint-board">
      <header>
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
              <tr key={sprint.sprint_id}>
                <td onClick={() => handleSprintClick(sprint)}>{sprint.sprint_name}</td>
                <td>{sprint.display_start_date}</td>
                <td>{sprint.display_end_date}</td>
                <td style={{ backgroundColor: getStatusColor(sprint.sprintstatus_id), color: 'white', fontWeight: 'bold' }}>
                  {sprint.status_name}
                </td>
                <td>
                  <button 
                    className={sprint.sprintstatus_id !== 1 ? 'view-sprint-btn' : 'ready-sprint-btn'}
                    onClick={() => handleSprintAction(sprint)}
                  >
                    {sprint.sprintstatus_id !== 1 ? 'VIEW SPRINT' : 'READY SPRINT'}
                  </button>
                  {showDeleteButtons && (
                    <button className="delete-sprint-round-btn" onClick={() => handleDeleteSprint(sprint.sprint_id)}>
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