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

  const loadData = () => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const storedSprints = JSON.parse(localStorage.getItem('sprints')) || [];
    const sprint = storedSprints.find(s => s.id === sprintId);
    setProductBacklog(storedTasks);
    setCurrentSprint(sprint);
    setSprintBacklog(sprint ? sprint.tasks || [] : []);
  };

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
      if (currentSprint && (currentSprint.status === 'Active' || currentSprint.status === 'Completed')) {
        alert("Cannot move tasks from an active or completed sprint.");
        return;
      }
      setProductBacklog([...productBacklog, task]);
      setSprintBacklog(sprintBacklog.filter(t => t.id !== task.id));
    }
  };

  const handleSave = () => {
    if (sprintBacklog.length === 0) {
      const updatedSprints = JSON.parse(localStorage.getItem('sprints')).filter(s => s.id !== sprintId);
      localStorage.setItem('sprints', JSON.stringify(updatedSprints));
      localStorage.setItem('tasks', JSON.stringify([...productBacklog, ...sprintBacklog]));
      alert("Sprint was empty and has been deleted.");
      navigate('/sprint-board');
    } else {
      const updatedSprints = JSON.parse(localStorage.getItem('sprints')).map(s => 
        s.id === sprintId ? { ...s, tasks: sprintBacklog } : s
      );
      localStorage.setItem('sprints', JSON.stringify(updatedSprints));
      localStorage.setItem('tasks', JSON.stringify(productBacklog));
      navigate('/sprint-board');
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleTaskClose = () => {
    setSelectedTask(null);
  };

  return (
    <div className="sprint-backlog-page">
      <header className="page-header">
        <h2 className="sprint-title">Sprint Backlog: {currentSprint?.name}</h2>
        <button className="save-sprint-button" onClick={handleSave}>Save Sprint</button>
      </header>
      <div className="sprint-task-selection">
        <div className="task-selection-container">
          <div className="backlog-column product-backlog-selection">
            <h3 className="backlog-heading">Product Backlog</h3>
            <div 
              className="task-grid-container"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'product')}
            >
              <div className="task-grid">
                {productBacklog.map(task => (
                  <div 
                    key={task.id}
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
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'sprint')}
            >
              <div className="task-grid">
                {sprintBacklog.map(task => (
                  <div 
                    key={task.id}
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