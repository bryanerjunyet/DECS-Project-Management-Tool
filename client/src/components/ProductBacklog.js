// // src/components/ProductBacklog.js
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import TaskCard from './TaskCard';

// function ProductBacklog() {
//   const [tasks, setTasks] = useState([]);
//   const navigate = useNavigate();

//   const handleNewTask = () => {
//     navigate('/task/new');
//   };

//   const handleTaskClick = (id) => {
//     navigate(`/task/${id}`);
//   };

//   return (
//     <div className="content">
//       <header>
//         <h1>Product Backlog</h1>
//         <button className="new-task" onClick={handleNewTask}>
//           + New Task
//         </button>
//       </header>
//       <section className="task-board">
//         {tasks.map((task) => (
//           <TaskCard key={task.id} task={task} onClick={() => handleTaskClick(task.id)} />
//         ))}
//       </section>
//     </div>
//   );
// }

// export default ProductBacklog;


//////////////////////////////////////////SECOND VERSION//////////////////////////////////////////////




// // src/components/ProductBacklog.js
// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import TaskCard from './TaskCard'; // Keep using your TaskCard component if it helps with task display.

// function ProductBacklog() {
//   const [tasks, setTasks] = useState([
//     // Example tasks, fetch these from your state or API in the future
//     { id: 1, name: "Task 1", status: "IN PROGRESS", stage: "DEVELOPMENT" },
//     { id: 2, name: "Task 2", status: "STARTED", stage: "PLANNING" },
//   ]);
//   const navigate = useNavigate();

//   const handleNewTask = () => {
//     navigate('/new-task'); // Update the path for adding a new task
//   };

//   const handleTaskClick = (id) => {
//     navigate(`/task-details/${id}`); // Update the path for task details
//   };

//   return (
//     <div className="content">
//       <header>
//         <h1>Product Backlog</h1>
//         <button className="new-task" onClick={handleNewTask}>
//           + New Task
//         </button>
//       </header>
//       <section className="task-board">
//         {tasks.length > 0 ? (
//           tasks.map((task) => (
//             <TaskCard
//               key={task.id}
//               task={task}
//               onClick={() => handleTaskClick(task.id)}
//             />
//           ))
//         ) : (
//           <p>No tasks available. Add a new task to get started!</p>
//         )}
//       </section>
//     </div>
//   );
// }

// export default ProductBacklog;







//////////////////////////////////////////THIRD VERSION//////////////////////////////////////////////




// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import TaskCard from './TaskCard';

// function ProductBacklog() {
//   const [tasks, setTasks] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchTasks();
//   }, []);

//   const fetchTasks = async () => {
//     try {
//       const response = await fetch('http://localhost:3001/tasks');
//       const data = await response.json();
//       setTasks(data);
//     } catch (error) {
//       console.error('Error fetching tasks:', error);
//     }
//   };

//   const handleNewTask = () => {
//     navigate('/new-task');
//   };

//   const handleTaskClick = (id) => {
//     navigate(`/task-details/${id}`);
//   };

//   return (
//     <div className="content">
//       <header>
//         <h1>Product Backlog</h1>
//         <button className="new-task" onClick={handleNewTask}>
//           + New Task
//         </button>
//       </header>
//       <section className="task-board">
//         {tasks.length > 0 ? (
//           tasks.map((task) => (
//             <TaskCard
//               key={task.id}
//               task={task}
//               onClick={() => handleTaskClick(task.id)}
//             />
//           ))
//         ) : (
//           <p>No tasks available. Add a new task to get started!</p>
//         )}
//       </section>
//     </div>
//   );
// }

// export default ProductBacklog;


//////////////////////////////////////////FOURTH VERSION//////////////////////////////////////////////

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TaskCard from './TaskCard';

function ProductBacklog() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchTasks();
  }, [location]); // Re-fetch tasks when location changes (i.e., when navigating back to this page)

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:3001/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again.');
    }
  };

  const handleNewTask = () => {
    navigate('/new-task');
  };

  const handleTaskClick = (id) => {
    navigate(`/task-details/${id}`);
  };

  return (
    <div className="content">
      <header>
        <h1>Product Backlog</h1>
        <button className="new-task" onClick={handleNewTask}>
          + New Task
        </button>
      </header>
      {error && <div className="error-message">{error}</div>}
      <section className="task-board">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => handleTaskClick(task.id)}
            />
          ))
        ) : (
          <p>No tasks available. Add a new task to get started!</p>
        )}
      </section>
    </div>
  );
}

export default ProductBacklog;