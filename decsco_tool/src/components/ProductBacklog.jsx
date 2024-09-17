import React, { useState, useEffect } from 'react';
import TaskCardView from './TaskCardView';
import TaskCardForm from './TaskCardForm';
import './ProductBacklog.css';

const ProductBacklog = () => {
  const [tasks, setTasks] = useState([]);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(storedTasks);
  };

  const addNewTask = (task) => {
    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setShowNewTaskForm(false);
  };

  return (
    <div className="product-backlog">
      <header>
        <h1>Product Backlog</h1>
        <button className="new-task" onClick={() => setShowNewTaskForm(true)}>+ New Task</button>
      </header>
      
      <div className="controls">
        <img
          src="/utils/filter_button.png"
          alt="Filter"
          className="filter-button"
          onClick={() => setShowFilterOptions(!showFilterOptions)}
        />
        <img
          src="/utils/sort_button.png"
          alt="Sort"
          className="sort-button"
          onClick={() => setShowSortOptions(!showSortOptions)}
        />
      </div>

      {showFilterOptions && (
        <div className="filter-options">
          {/* Add filter options here */}
        </div>
      )}

      {showSortOptions && (
        <div className="sort-options">
          {/* Add sort options here */}
        </div>
      )}

      <section className="task-board">
        {tasks.map(task => (
          <TaskCardView key={task.id} task={task} />
        ))}
      </section>

      {showNewTaskForm && (
        <TaskCardForm onSubmit={addNewTask} onCancel={() => setShowNewTaskForm(false)} />
      )}
    </div>
  );
};

export default ProductBacklog;


// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import NavigationSidebar from './NavigationSidebar';
// // import TaskBoard from '../components/TaskBoard';
// import './ProductBacklog.css'; // Create a separate CSS file for ProductBacklog

// const ProductBacklog = () => {
// //   const [tasks, setTasks] = useState([]);

// //   useEffect(() => {
// //     // Load tasks from local storage
// //     const loadedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
// //     setTasks(loadedTasks);
// //   }, []);

//     const navigate = useNavigate();

//     const onClickNewTaskButton = () => {
//         console.log("test");
//         navigate('/task-form');
//     };

//     return (
//         <section className="product-backlog">
//             <header className="page-header">
//                     <h1>Product Backlog</h1>
//                 <button className="new-task" onClick={onClickNewTaskButton}>+ New Task</button>
//             </header>
//             {/* <TaskBoard tasks={tasks} /> */}
//         </section>
//     );
// };

// export default ProductBacklog;