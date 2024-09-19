import React, { useState, useEffect } from 'react';
import TaskCardView from './TaskCardView';
import TaskCardForm from './TaskCardForm';
import TaskCardDetails from './TaskCardDetails';
import FilterSortControls from './FilterSortControls';
import './ProductBacklog.css';

const ProductBacklog = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [filters, setFilters] = useState({ tags: [] });

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, tasks]);

  const loadTasks = () => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(storedTasks);
    setFilteredTasks(storedTasks);
  };

  const addNewTask = (task) => {
    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setShowNewTaskForm(false);
  };

  const openTaskDetails = (task) => {
    setSelectedTask(task);
  };

  const saveTaskDetails = (updatedTask) => {
    const updatedTasks = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setSelectedTask(null);
  };

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter((t) => t.id !== taskId);
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setSelectedTask(null);
  };

  const closeTaskDetails = () => {
    setSelectedTask(null);
  };

  const applyFilters = () => {
    let updatedTasks = tasks;
    if (filters.tags.length > 0) {
      updatedTasks = updatedTasks.filter((task) =>
        filters.tags.every((tag) => task.tags.includes(tag))
      );
    }
    setFilteredTasks(updatedTasks);
  };

  const handleTagFilterChange = (e) => {
    const { value, checked } = e.target;
    setFilters((prevFilters) => {
      const newTags = checked
        ? [...prevFilters.tags, value]
        : prevFilters.tags.filter((tag) => tag !== value);
      return { ...prevFilters, tags: newTags };
    });
  };

  const clearFilters = () => {
    setFilters({ tags: [] });
  };

  const handleSort = (sortType) => {
    let sortedTasks = [...filteredTasks];
    switch (sortType) {
      case 'urgent-low':
        sortedTasks.sort((a, b) => {
          const priorities = { URGENT: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
          return priorities[a.priority] - priorities[b.priority];
        });
        break;
      case 'low-urgent':
        sortedTasks.sort((a, b) => {
          const priorities = { URGENT: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
          return priorities[b.priority] - priorities[a.priority];
        });
        break;
      case 'latest-oldest':
        sortedTasks.sort((a, b) => new Date(b.id) - new Date(a.id));
        break;
      case 'oldest-latest':
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
        <button className="new-task" onClick={() => setShowNewTaskForm(true)}>
          + New Task
        </button>
      </header>

      {/* Filter and Sort Controls */}
      <FilterSortControls
        filters={filters}
        setFilters={setFilters}
        handleTagFilterChange={handleTagFilterChange}
        clearFilters={clearFilters}
        handleSort={handleSort}
      />

      {/* Task Board */}
      <section className="task-board">
        {filteredTasks.map((task) => (
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
