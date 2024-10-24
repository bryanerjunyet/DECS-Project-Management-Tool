import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TaskCardView from '../components/TaskCardView';
import TaskCardDetails from '../components/TaskCardDetails';
import './SprintBacklog.css';

const SprintBacklog = () => {
  const [productBacklog, setProductBacklog] = useState([]);
  const [sprintBacklog, setSprintBacklog] = useState([]);
  const [currentSprint, setCurrentSprint] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const { sprintId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [sprintId]);

  const loadData = async () => {
    try {
      // Retrieve product backlog tasks from database
      const response = await fetch('http://localhost:3001/product_backlog', {
        method: 'GET'
      });

      // Sets current tasks to empty if there are no tasks
      if (response.status === 204) {
        setProductBacklog([]);
      } else if (!response.ok) {
        throw new Error('Unable to retrieve tasks from database in Product Backlog.');
      } else {
        const jsonData = await response.json();
        const storedTasks = jsonData.rows;
        setProductBacklog(storedTasks);
      }
    } catch (err) {
      console.error('Error fetching product backlog:', err);
    }

    try {
      // Retrieve product backlog tasks from database
      const sprintRes = await fetch(`http://localhost:3001/sprints/tasks?sprint_id=${sprintId}`, {
        method: 'GET'
      });

      // Sets current tasks to empty if there are no tasks
      if (sprintRes.status === 204) {
        setSprintBacklog([]);
        return;
      } else if (!sprintRes.ok) {
        throw new Error('Unable to retrieve tasks from database in Product Backlog.');
      }
      const sprintData = await sprintRes.json();
      const storedSprintTasks = sprintData.rows;
      setSprintBacklog(storedSprintTasks);
    } catch (err) {
      console.error('Error fetching sprint backlog:', err);
    }
  }

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(task));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleProductBacklogDrop = async (e) => {
    const droppedTask = JSON.parse(e.dataTransfer.getData('text/plain'));

    if (!productBacklog.some(task => task['task_id'] === droppedTask.task_id)) {
      try {
        const response = await fetch(`http://localhost:3001/sprints/tasks?task_id=${droppedTask.task_id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (!response.ok) {
          throw new Error(response.message);
        }
        loadData()
      } catch (err) {
        console.error('Failed to move task to product backlog:', err);
      }
    }
  }

  const handleSprintDrop = async (e) => {
    const droppedTask = JSON.parse(e.dataTransfer.getData('text/plain'));
    if (!sprintBacklog.some(task => task['task_id'] === droppedTask.task_id)) {
      try {
        const response = await fetch('http://localhost:3001/sprints/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sprint_id: sprintId,
            task_id: droppedTask.task_id
          }),
        });
  
        if (!response.ok) {
          throw new Error(response.message);
        }
        loadData();
      } catch (err) {
        console.error('Failed to assign task to sprint:', err);
      }
    }
  }

  const handleBack = () => {
    navigate('/sprint-board');
  }

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleTaskClose = () => {
    setSelectedTask(null);
  };

  return (
    <div className="sprint-backlog-page">
      <header className="page-header">
        <h2 className="sprint-title">Sprint Backlog: {currentSprint?.sprint_name}</h2>
        <button className="back-button" onClick={handleBack}>Back to Sprint Board</button>
      </header>
      <div className="sprint-task-selection">
        <div className="task-selection-container">
          <div className="backlog-column product-backlog-selection">
            <h3 className="backlog-heading">Product Backlog</h3>
            <div 
              className="task-grid-container"
              id="product_container"
              onDragOver={handleDragOver}
              onDrop={(e) => handleProductBacklogDrop(e, 'product')}
            >
              <div className="task-grid" id="product_grid">
                {productBacklog.map(task => (
                  <div 
                    key={task.task_id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                  >
                    <TaskCardView task={task} onClick={() => handleTaskClick(task)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="backlog-column sprint-backlog-selection">
            <h3 className="backlog-heading">Sprint Backlog</h3>
            <div 
              className="task-grid-container"
              id="sprint_container"
              onDragOver={handleDragOver}
              onDrop={(e) => handleSprintDrop(e, 'sprint')}
            >
              <div className="task-grid" id="sprint_grid">
                {sprintBacklog.map(task => (
                  <div 
                    key={task.task_id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                  >
                    <TaskCardView task={task} onClick={() => handleTaskClick(task)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedTask && (
        <TaskCardDetails
          task={selectedTask}
          onClose={handleTaskClose}
          readOnly={true}
        />
      )}
    </div>
  );
};

export default SprintBacklog;