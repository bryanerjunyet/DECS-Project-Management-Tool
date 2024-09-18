import React, { useState, useEffect } from 'react';
import TaskCardView from './TaskCardView';
import TaskCardForm from './TaskCardForm';
import TaskCardDetails from './TaskCardDetails';
import './ProductBacklog.css';

const ProductBacklog = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // State to hold filters
  const [filters, setFilters] = useState({
    tags: []
  });

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Apply filters whenever filters or tasks change
  useEffect(() => {
    applyFilters();
  }, [filters, tasks]);

  // Load tasks from localStorage (or use an empty array)
  const loadTasks = () => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(storedTasks);
    setFilteredTasks(storedTasks);
  };

  // Handle adding a new task
  const addNewTask = (task) => {
    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setShowNewTaskForm(false);
  };

  // Open task details modal
  const openTaskDetails = (task) => {
    setSelectedTask(task);
  };

  // Save task details after editing
  const saveTaskDetails = (updatedTask) => {
    const updatedTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setSelectedTask(null);
  };

  // Delete a task
  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setSelectedTask(null);
  };

  // Close task details modal
  const closeTaskDetails = () => {
    setSelectedTask(null);
  };

  // Apply filters to tasks
  const applyFilters = () => {
    let updatedTasks = tasks;

    // Filter by selected tags
    if (filters.tags.length > 0) {
      updatedTasks = updatedTasks.filter(task =>
        filters.tags.every(tag => task.tags.includes(tag))
      );
    }

    setFilteredTasks(updatedTasks);
  };

  // Handle tag filter checkbox change and immediately apply filters
  const handleTagFilterChange = (e) => {
    const { value, checked } = e.target;

    setFilters((prevFilters) => {
      const newTags = checked
        ? [...prevFilters.tags, value] // Add the tag if checked
        : prevFilters.tags.filter(tag => tag !== value); // Remove the tag if unchecked

      return {
        ...prevFilters,
        tags: newTags,
      };
    });
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      tags: []
    });
  };

  const handleSort = (sortType) => {
    let sortedTasks = [...filteredTasks];
  
    switch (sortType) {
      case 'urgent-low': // Sort from URGENT to LOW
        sortedTasks.sort((a, b) => {
          const priorities = { URGENT: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
          return priorities[a.priority] - priorities[b.priority];
        });
        break;
  
      case 'low-urgent': // Sort from LOW to URGENT
        sortedTasks.sort((a, b) => {
          const priorities = { URGENT: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
          return priorities[b.priority] - priorities[a.priority];
        });
        break;
  
      case 'latest-oldest': // Sort by latest to oldest
        sortedTasks.sort((a, b) => new Date(b.id) - new Date(a.id));
        break;
  
      case 'oldest-latest': // Sort by oldest to latest
        sortedTasks.sort((a, b) => new Date(a.id) - new Date(b.id));
        break;
  
      default:
        break;
    }
  
    setFilteredTasks(sortedTasks);
  };
  

  return (
    <div className="product-backlog">
      <header>
        <h1>Product Backlog</h1>
        <button className="new-task" onClick={() => setShowNewTaskForm(true)}>+ New Task</button>
      </header>

      {/* Filter and Sort Controls */}
      <div className="controls">
        {/* Filter Button */}
        <img
          src="./utils/filter_button.png"
          alt="Filter"
          className="filter-button"
          onClick={() => setShowFilterOptions(!showFilterOptions)}
        />
        {/* Sort Button */}
        <img
          src="./utils/sort_button.png"
          alt="Sort"
          className="sort-button"
          onClick={() => setShowSortOptions(!showSortOptions)}
        />
      </div>

      {/* Filter Options */}
      {showFilterOptions && (
        <div className="filter-options">
          <h3>Filter</h3>
          <div className="filter-tags">
            <label>
              <input
                type="checkbox"
                value="API"
                onChange={handleTagFilterChange}
                checked={filters.tags.includes("API")}
              /> API
            </label>
            <label>
              <input
                type="checkbox"
                value="Testing"
                onChange={handleTagFilterChange}
                checked={filters.tags.includes("Testing")}
              /> Testing
            </label>
            <label>
              <input
                type="checkbox"
                value="Database"
                onChange={handleTagFilterChange}
                checked={filters.tags.includes("Database")}
              /> Database
            </label>
            <label>
              <input
                type="checkbox"
                value="Frontend"
                onChange={handleTagFilterChange}
                checked={filters.tags.includes("Frontend")}
              /> Frontend
            </label>
            <label>
              <input
                type="checkbox"
                value="Backend"
                onChange={handleTagFilterChange}
                checked={filters.tags.includes("Backend")}
              /> Backend
            </label>
            <label>
              <input
                type="checkbox"
                value="UI/UX"
                onChange={handleTagFilterChange}
                checked={filters.tags.includes("UI/UX")}
              /> UI/UX
            </label>
          </div>
          <button className="clear-filters" onClick={clearFilters}>Clear Filters</button>
        </div>
      )}

      {/* Sort Options */}
      {showSortOptions && (
        <div className="sort-options">
          <h3>Sort</h3>
          <button className="sort-option" onClick={() => handleSort('urgent-low')}>Urgent to Low</button>
          <button className="sort-option" onClick={() => handleSort('low-urgent')}>Low to Urgent</button>
          <button className="sort-option" onClick={() => handleSort('latest-oldest')}>Latest to Oldest</button>
          <button className="sort-option" onClick={() => handleSort('oldest-latest')}>Oldest to Latest</button>
        </div>
      )}

      {/* Task Board */}
      <section className="task-board">
        {filteredTasks.map(task => (
          <TaskCardView key={task.id} task={task} onClick={() => openTaskDetails(task)} />
        ))}
      </section>

      {showNewTaskForm && (
        <TaskCardForm onSubmit={addNewTask} onCancel={() => setShowNewTaskForm(false)} />
      )}

      {selectedTask && (
        <TaskCardDetails
          task={selectedTask}
          onSave={saveTaskDetails}
          onDelete={deleteTask}
          onClose={closeTaskDetails}
        />
      )}
    </div>
  );
};

export default ProductBacklog;
