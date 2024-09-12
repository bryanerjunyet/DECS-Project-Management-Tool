import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationSidebar from './NavigationSidebar';
// import TaskBoard from '../components/TaskBoard';
import './ProductBacklog.css'; // Create a separate CSS file for ProductBacklog

const ProductBacklog = () => {
//   const [tasks, setTasks] = useState([]);

//   useEffect(() => {
//     // Load tasks from local storage
//     const loadedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
//     setTasks(loadedTasks);
//   }, []);

    const navigate = useNavigate();

    const onClickNewTaskButton = () => {
        console.log("test");
        navigate('/task-form');
    };

    return (
        <body className="product-backlog">
            <NavigationSidebar />
            <div className="main-content">
                <header className="page-header">
                        <h1>Product Backlog</h1>
                    <button className="new-task" onClick={onClickNewTaskButton}>+ New Task</button>
                </header>
                {/* <TaskBoard tasks={tasks} /> */}
            </div>
        </body>
    );
};

export default ProductBacklog;