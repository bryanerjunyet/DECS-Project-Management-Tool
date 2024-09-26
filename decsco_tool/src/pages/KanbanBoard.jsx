import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './KanbanBoard.css';

const KanbanBoard = () => {
  const [sprints, setSprints] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedSprints = JSON.parse(localStorage.getItem('sprints')) || [];
    setSprints(storedSprints);
  }, []);

  const handleSprintClick = (sprintId) => {
    navigate(`/kanban-view/${sprintId}`);
  };

  return (
    <div className="kanban-board">
      <header className="page-header">
        <h1>Kanban Board</h1>
      </header>
      {sprints.length === 0 ? (
        <div className="no-sprints">No sprints found.</div>
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
            {sprints.map((sprint) => (
              <tr key={sprint.id} onClick={() => handleSprintClick(sprint.id)}>
                <td>{sprint.name}</td>
                <td>{sprint.startDate}</td>
                <td>{sprint.endDate}</td>
                <td>{sprint.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default KanbanBoard;