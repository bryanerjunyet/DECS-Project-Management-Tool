import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import TaskCardView from './TaskCardView'; // Import the TaskCardView component
import './SprintDetails.css';

const SprintDetails = () => {
  const [sprint, setSprint] = useState(null);
  const { sprintId } = useParams();

  useEffect(() => {
    const storedSprints = JSON.parse(localStorage.getItem('sprints')) || [];
    const currentSprint = storedSprints.find(s => s.id === sprintId);
    setSprint(currentSprint);
  }, [sprintId]);

  if (!sprint) {
    return <div>Loading...</div>;
  }

  return (
    <div className="sprint-details">
      <h2>{sprint.name}</h2>
      <p>Start Date: {sprint.startDate}</p>
      <p>End Date: {sprint.endDate}</p>
      <p>Status: {sprint.status}</p>
      <h3>Tasks</h3>
      <div className="task-list">
        {sprint.tasks.map(task => (
          <TaskCardView key={task.id} task={task} /> // Use TaskCardView component
        ))}
      </div>
      <Link to={`/sprint/${sprintId}/backlog`} className="edit-sprint-link">
        Edit Sprint Backlog
      </Link>
    </div>
  );
};

export default SprintDetails;