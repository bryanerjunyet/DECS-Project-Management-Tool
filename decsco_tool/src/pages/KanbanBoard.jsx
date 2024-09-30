import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './KanbanBoard.css';

const KanbanBoard = () => {
  const [activeSprints, setActiveSprints] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedSprints = JSON.parse(localStorage.getItem('sprints')) || [];
    const active = storedSprints.filter(sprint => sprint.status === 'Active');
    setActiveSprints(active);
  }, []);

  const handleSprintClick = (sprintId) => {
    navigate(`/kanban-view/${sprintId}`);
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
    <div className="kanban-board">
      <header className="page-header">
        <h1>Kanban Board</h1>
      </header>
      <div className="sprint-table-container">
      {activeSprints.length === 0 ? (
        <div className="no-active-sprints">No active sprints found.</div>
      ) : (
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
            {activeSprints.map((sprint) => (
              <tr key={sprint.id} onClick={() => handleSprintClick(sprint.id)}>
                <td>{sprint.name}</td>
                <td>{sprint.startDate}</td>
                <td>{sprint.endDate}</td>
                <td style={{ 
                  backgroundColor: getStatusColor(sprint.status), 
                  color: 'white', 
                  fontWeight: 'bold',
                  padding: '8px',
                  borderRadius: '4px'
                }}>
                  {sprint.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      </div>
    </div>
  );
};

export default KanbanBoard;