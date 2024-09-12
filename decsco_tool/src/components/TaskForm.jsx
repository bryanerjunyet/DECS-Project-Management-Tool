import React, { useEffect, useState } from 'react';
import NavigationSidebar from './NavigationSidebar';

const TaskForm = () => {
    //   const [tasks, setTasks] = useState([]);
    
    //   useEffect(() => {
    //     // Load tasks from local storage
    //     const loadedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    //     setTasks(loadedTasks);
    //   }, []);
    return (
        <body className="product-backlog">
            <NavigationSidebar />
            <div className="main-content">
                <header className="page-header">
                    <h1>Create a new task</h1>
                </header>
                {/* <TaskBoard tasks={tasks} /> */}
            </div>
        </body>
    );
};
    
    export default TaskForm;