import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TaskCardView from './TaskCardView'; // Import the TaskCardView component
import './SprintBacklog.css';

const SprintBacklog = () => {
  const [productBacklog, setProductBacklog] = useState([]);
  const [sprintBacklog, setSprintBacklog] = useState([]);
  const [currentSprint, setCurrentSprint] = useState(null);
  const { sprintId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const storedSprints = JSON.parse(localStorage.getItem('sprints')) || [];
    const sprint = storedSprints.find(s => s.id === sprintId);
    setProductBacklog(storedTasks);
    setCurrentSprint(sprint);
    setSprintBacklog(sprint ? sprint.tasks || [] : []);
  }, [sprintId]);

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(task));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetBacklog) => {
    e.preventDefault();
    const task = JSON.parse(e.dataTransfer.getData('text/plain'));
    if (targetBacklog === 'sprint' && !sprintBacklog.some(t => t.id === task.id)) {
      setSprintBacklog([...sprintBacklog, task]);
      setProductBacklog(productBacklog.filter(t => t.id !== task.id));
    } else if (targetBacklog === 'product' && !productBacklog.some(t => t.id === task.id)) {
      setProductBacklog([...productBacklog, task]);
      setSprintBacklog(sprintBacklog.filter(t => t.id !== task.id));
    }
  };

  const handleSave = () => {
    const updatedSprints = JSON.parse(localStorage.getItem('sprints')).map(s => 
      s.id === sprintId ? { ...s, tasks: sprintBacklog } : s
    );
    localStorage.setItem('sprints', JSON.stringify(updatedSprints));
    localStorage.setItem('tasks', JSON.stringify(productBacklog));
    navigate('/sprint-board');
  };

  const handleTaskClick = (task) => {
    // Implement task click behavior if needed
    console.log('Task clicked:', task);
  };

  return (
    <div className="sprint-task-selection">
      <h2>Select Tasks for Sprint: {currentSprint?.name}</h2>
      <div className="task-selection-container">
        <div 
          className="product-backlog-selection"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'product')}
        >
          <h3>Product Backlog</h3>
          <div className="task-grid">
            {productBacklog.map(task => (
              <div 
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
              >
                <TaskCardView task={task} onClick={handleTaskClick} />
              </div>
            ))}
          </div>
        </div>
        <div 
          className="sprint-backlog-selection" 
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'sprint')}
        >
          <h3>Sprint Backlog</h3>
          <div className="task-grid">
            {sprintBacklog.map(task => (
              <div 
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
              >
                <TaskCardView task={task} onClick={handleTaskClick} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <button onClick={handleSave}>Save Sprint Tasks</button>
    </div>
  );
};

export default SprintBacklog;