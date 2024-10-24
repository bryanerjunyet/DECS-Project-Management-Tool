import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './KanbanBoard.css';

const KanbanBoard = () => {
  const [activeSprints, setActiveSprints] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {


    fetchSprints();
  }, []);

  const fetchSprints = async () => {
    try {
      // Retrieve active sprints from database
      const response = await fetch('http://localhost:3001/sprints?sprintstatus_id=2', {
        method: 'GET'
      });

      // Sets active sprints to empty if there are no active sprints
      if (response.status === 204) {
        setActiveSprints([]);
        return;
      } else if (!response.ok) {
        throw new Error(response.message);
      }
      const jsonData = await response.json();

      const storedSprints = jsonData.rows;

      setActiveSprints(storedSprints);
    } catch (err) {
      console.error('Error fetching sprints:', err);
    }
  }

  const handleSprintClick = (sprintId) => {
    navigate(`/kanban-view/${sprintId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 3:
        return '#489848'; // Green
      case 2:
        return '#e3c93a'; // Yellow (using orange for better visibility)
      default:
        return '#e3c93a'; // Dark gray for any other status
    }
  };

  return (
    <div className="kanban-board">
      <header>
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
              <tr key={sprint.sprint_id} onClick={() => handleSprintClick(sprint.sprint_id)}>
                <td>{sprint.sprint_name}</td>
                <td>{sprint.display_start_date}</td>
                <td>{sprint.display_end_date}</td>
                <td style={{ 
                  backgroundColor: getStatusColor(sprint.status), 
                  color: 'white', 
                  fontWeight: 'bold',
                  padding: '8px',
                  borderRadius: '4px'
                }}>
                  {sprint.status_name}
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