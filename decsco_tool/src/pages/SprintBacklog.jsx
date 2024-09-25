import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TaskCardView from '../components/TaskCardView';
import './SprintBacklog.css';

const SprintBacklog = () => {
  const [productBacklog, setProductBacklog] = useState([]);
  const [sprintBacklog, setSprintBacklog] = useState([]);
  const [currentSprint, setCurrentSprint] = useState(null);
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
      // Delete the sprint if it's empty
      const updatedSprints = JSON.parse(localStorage.getItem('sprints')).filter(s => s.id !== sprintId);
      localStorage.setItem('sprints', JSON.stringify(updatedSprints));
      localStorage.setItem('tasks', JSON.stringify([...productBacklog, ...sprintBacklog]));
      alert("Sprint was empty and has been deleted.");
      navigate('/sprint-board');
    } else {
      // Update the sprint with new tasks
      const updatedSprints = JSON.parse(localStorage.getItem('sprints')).map(s => 
        s.id === sprintId ? { ...s, tasks: sprintBacklog } : s
      );
      localStorage.setItem('sprints', JSON.stringify(updatedSprints));
      localStorage.setItem('tasks', JSON.stringify(productBacklog));
      navigate('/sprint-board');
    }
  };

  const handleTaskClick = (task) => {
    // Implement task click behavior if needed
    console.log('Task clicked:', task);
  };

  // ... rest of the component remains the same
};

export default SprintBacklog;