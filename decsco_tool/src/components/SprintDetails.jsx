import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import TaskCardView from './TaskCardView';
import SprintModal from './SprintModal';
import TaskCardDetails from './TaskCardDetails';
import './SprintDetails.css';

const SprintDetails = ({ sprint, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentSprint, setCurrentSprint] = useState(sprint);
  const [sprintTasks, setSprintTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async() => {
    try {
      // Retrieve sprint tasks from database
      const response = await fetch(`http://localhost:3001/sprints/tasks?sprint_id=${sprint.sprint_id}`, {
        method: 'GET'
      });

      // Sets current sprint tasks to empty if there are no tasks
      if (response.status === 204) {
        setSprintTasks([]);
        return;
      } else if (!response.ok) {
        throw new Error(response.message);
      }
      const jsonData = await response.json();

      const storedTasks = jsonData.rows;
      setSprintTasks(storedTasks);
    } catch (err) {
      console.error('Error fetching sprint tasks:', err);
    }
  }


  const handleEditClick = () => {
    setIsEditing(true);
  };


  const handleSave = async(updatedSprint) => {
    // Updates the sprint in the database
    console.log(updatedSprint)
    try {
      const response = await fetch('http://localhost:3001/sprints', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSprint),
    });

    if (!response.ok) {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error('Failed to update sprint:', err);
    }

    setCurrentSprint(updatedSprint);
    onUpdate(updatedSprint);
    setIsEditing(false);
};


  const handleCancel = () => {
    setIsEditing(false);
  };

  const isSprintEditable = currentSprint.sprintstatus_id === 1;

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#489848'; // Green
      case 'Started':
        return '#e3c93a'; // Yellow (using orange for better visibility)
      default:
        return 'rgb(0, 140, 168)'; // Light blue for any other status
    }
  };

  const StatusBadge = ({ status }) => (
    <span style={{
      backgroundColor: getStatusColor(status),
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold',
      display: 'inline-block',
      marginLeft: '10px'
    }}>
      {status}
    </span>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content sprint-details-modal">
        <h2>{currentSprint.sprint_name}</h2>
        <p>Start Date: {currentSprint.display_start_date}</p>
        <p>End Date: {currentSprint.display_end_date}</p>
        <p>Status: <StatusBadge status={currentSprint.status_name} /></p>
        {isSprintEditable && (
          <button className="edit-sprint-button" onClick={handleEditClick}>Edit Sprint</button>
        )}
        <h3 className="tasks-heading">Tasks</h3>
        <div className="task-grid">
          {sprintTasks && sprintTasks.map(task => (
            <div key={task.task_id} onClick={() => handleTaskClick(task)}>
              <TaskCardView task={task} />
            </div>
          ))}
        </div>
        <div className="modal-actions">
          {isSprintEditable && (
            <Link to={`/sprint/${currentSprint.sprint_id}/backlog`} className="edit-sprint-link">
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