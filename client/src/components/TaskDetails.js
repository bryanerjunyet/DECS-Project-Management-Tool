// // src/components/TaskDetails.js
// import React, { useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';

// function TaskDetails() {
//   const { id } = useParams();
//   const isNewTask = id === 'new';
//   const [task, setTask] = useState(isNewTask ? {} : getTaskById(id)); // getTaskById is a placeholder for your task fetching logic
//   const navigate = useNavigate();

//   const handleSave = () => {
//     if (isNewTask) {
//       saveNewTask(task);  // Implement this function to save a new task
//     } else {
//       updateTask(id, task); // Implement this function to update an existing task
//     }
//     navigate('/');
//   };

//   return (
//     <div className="task-details">
//       <h2>{isNewTask ? 'New Task' : 'Edit Task'}</h2>
//       <form>
//         <input
//           type="text"
//           placeholder="Task Name"
//           value={task.name || ''}
//           onChange={(e) => setTask({ ...task, name: e.target.value })}
//         />
//         {/* Add other form fields for tags, description, stage, status, etc. */}
//         <button type="button" onClick={handleSave}>Save Task</button>
//       </form>
//     </div>
//   );
// }

// export default TaskDetails;


/////////////////////////////////VERSION 2/////////////////////////////////////////



// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';

// function TaskDetails({ fetchTaskById, saveNewTask, updateTask }) {
//   const { id } = useParams();
//   const isNewTask = !id; // Check if it's a new task or an existing one
//   const navigate = useNavigate();
  
//   const [task, setTask] = useState({
//     name: '',
//     tags: [],
//     description: '',
//     stage: 'DEVELOPMENT',
//     status: 'IN PROGRESS',
//     assignee: '',
//     storyPoints: 1,
//   });

//   // Fetch the task details if editing an existing task
//   useEffect(() => {
//     if (id) {
//       fetchTaskById(id).then(data => {
//         setTask(data);
//       }).catch(error => {
//         console.error("Error fetching task:", error);
//       });
//     }
//   }, [id, fetchTaskById]);

//   // Handle Save (Create new task or Update existing task)
//   const handleSave = () => {
//     if (isNewTask) {
//       saveNewTask(task)
//         .then(() => {
//           navigate('/'); // Redirect to the Product Backlog Dashboard
//         })
//         .catch(error => {
//           console.error("Error saving new task:", error);
//         });
//     } else {
//       updateTask(id, task)
//         .then(() => {
//           navigate('/'); // Redirect to the Product Backlog Dashboard
//         })
//         .catch(error => {
//           console.error("Error updating task:", error);
//         });
//     }
//   };

//   const toggleStage = () => {
//     const stages = ['PLANNING', 'DEVELOPMENT', 'TESTING', 'INTEGRATION'];
//     const currentIndex = stages.indexOf(task.stage);
//     const nextIndex = (currentIndex + 1) % stages.length;
//     setTask({ ...task, stage: stages[nextIndex] });
//   };

//   const toggleStatus = () => {
//     const statuses = ['STARTED', 'IN PROGRESS', 'COMPLETED'];
//     const currentIndex = statuses.indexOf(task.status);
//     const nextIndex = (currentIndex + 1) % statuses.length;
//     setTask({ ...task, status: statuses[nextIndex] });
//   };

//   const addTag = (tag) => {
//     setTask({ ...task, tags: [...task.tags, tag] });
//   };

//   return (
//     <div className="task-details">
//       <h2>{isNewTask ? 'New Task' : 'Edit Task'}</h2>
//       <form>
//         {/* Task Name */}
//         <input
//           type="text"
//           placeholder="Task Name"
//           value={task.name}
//           onChange={(e) => setTask({ ...task, name: e.target.value })}
//         />

//         {/* Tags */}
//         <div>
//           <button type="button" onClick={() => addTag('frontend')}>+ Frontend</button>
//           <button type="button" onClick={() => addTag('UI/UX')}>+ UI/UX</button>
//           <button type="button" onClick={() => addTag('database')}>+ Database</button>
//           <button type="button" onClick={() => addTag('backend')}>+ Backend</button>
//           <button type="button" onClick={() => addTag('testing')}>+ Testing</button>
//           <button type="button" onClick={() => addTag('API')}>+ API</button>
//         </div>

//         {/* Task Description */}
//         <textarea
//           placeholder="Task Description"
//           value={task.description}
//           onChange={(e) => setTask({ ...task, description: e.target.value })}
//         />

//         {/* Stage Toggle */}
//         <button type="button" onClick={toggleStage}>{task.stage}</button>

//         {/* Status Toggle */}
//         <button type="button" onClick={toggleStatus}>{task.status}</button>

//         {/* Assignee */}
//         <input
//           type="text"
//           placeholder="Assignee"
//           value={task.assignee}
//           onChange={(e) => setTask({ ...task, assignee: e.target.value })}
//         />

//         {/* Story Points */}
//         <input
//           type="range"
//           min="1"
//           max="10"
//           value={task.storyPoints}
//           onChange={(e) => setTask({ ...task, storyPoints: parseInt(e.target.value) })}
//         />

//         {/* Save Button */}
//         <button type="button" onClick={handleSave}>Save Task</button>
//       </form>
//     </div>
//   );
// }

// export default TaskDetails;





///////////////////////////////////////VERSION 3///////////////////////////////////////////

// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';

// function TaskDetails() {
//   const { id } = useParams();
//   const isNewTask = !id;
//   const navigate = useNavigate();
  
//   const [task, setTask] = useState({
//     name: '',
//     tags: [],
//     description: '',
//     stage: 'DEVELOPMENT',
//     status: 'IN PROGRESS',
//     assignee: '',
//     storyPoints: 1,
//     typeOfTask: 'Story',
//     priority: 'LOW'
//   });

//   useEffect(() => {
//     if (id) {
//       fetchTask(id);
//     }
//   }, [id]);

//   const fetchTask = async (taskId) => {
//     try {
//       const response = await fetch(`http://localhost:3001/tasks/${taskId}`);
//       const data = await response.json();
//       setTask(data);
//     } catch (error) {
//       console.error("Error fetching task:", error);
//     }
//   };

//   const handleSave = async () => {
//     try {
//       const url = isNewTask ? 'http://localhost:3001/tasks' : `http://localhost:3001/tasks/${id}`;
//       const method = isNewTask ? 'POST' : 'PUT';
      
//       const response = await fetch(url, {
//         method: method,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(task),
//       });

//       if (response.ok) {
//         navigate('/');
//       } else {
//         throw new Error('Failed to save task');
//       }
//     } catch (error) {
//       console.error("Error saving task:", error);
//     }
//   };

//   const toggleStage = () => {
//     const stages = ['PLANNING', 'DEVELOPMENT', 'TESTING', 'INTEGRATION'];
//     const currentIndex = stages.indexOf(task.stage);
//     const nextIndex = (currentIndex + 1) % stages.length;
//     setTask({ ...task, stage: stages[nextIndex] });
//   };

//   const toggleStatus = () => {
//     const statuses = ['STARTED', 'IN PROGRESS', 'COMPLETED'];
//     const currentIndex = statuses.indexOf(task.status);
//     const nextIndex = (currentIndex + 1) % statuses.length;
//     setTask({ ...task, status: statuses[nextIndex] });
//   };

//   const addTag = (tag) => {
//     if (!task.tags.includes(tag)) {
//       setTask({ ...task, tags: [...task.tags, tag] });
//     }
//   };

//   const removeTag = (tagToRemove) => {
//     setTask({ ...task, tags: task.tags.filter(tag => tag !== tagToRemove) });
//   };

//   return (
//     <div className="task-details">
//       <h2>{isNewTask ? 'New Task' : 'Edit Task'}</h2>
//       <form>
//         <input
//           type="text"
//           placeholder="Task Name"
//           value={task.name}
//           onChange={(e) => setTask({ ...task, name: e.target.value })}
//         />

//         <div className="tags-container">
//           {task.tags.map((tag, index) => (
//             <span key={index} className="tag">
//               {tag}
//               <button type="button" onClick={() => removeTag(tag)}>x</button>
//             </span>
//           ))}
//         </div>
//         <div className="tag-buttons">
//           {['frontend', 'UI/UX', 'database', 'backend', 'testing', 'API'].map((tag) => (
//             <button key={tag} type="button" onClick={() => addTag(tag)}>+ {tag}</button>
//           ))}
//         </div>

//         <textarea
//           placeholder="Task Description"
//           value={task.description}
//           onChange={(e) => setTask({ ...task, description: e.target.value })}
//         />

//         <button type="button" onClick={toggleStage} className="stage-button">{task.stage}</button>
//         <button type="button" onClick={toggleStatus} className={`status-button ${task.status.toLowerCase().replace(' ', '-')}`}>{task.status}</button>

//         <input
//           type="text"
//           placeholder="Assignee"
//           value={task.assignee}
//           onChange={(e) => setTask({ ...task, assignee: e.target.value })}
//         />

//         <div className="story-points">
//           <label>Story Points: {task.storyPoints}</label>
//           <input
//             type="range"
//             min="1"
//             max="10"
//             value={task.storyPoints}
//             onChange={(e) => setTask({ ...task, storyPoints: parseInt(e.target.value) })}
//           />
//         </div>

//         <div className="type-of-task">
//           <label>
//             <input
//               type="radio"
//               value="Story"
//               checked={task.typeOfTask === 'Story'}
//               onChange={(e) => setTask({ ...task, typeOfTask: e.target.value })}
//             /> Story
//           </label>
//           <label>
//             <input
//               type="radio"
//               value="Bug"
//               checked={task.typeOfTask === 'Bug'}
//               onChange={(e) => setTask({ ...task, typeOfTask: e.target.value })}
//             /> Bug
//           </label>
//         </div>

//         <select
//           value={task.priority}
//           onChange={(e) => setTask({ ...task, priority: e.target.value })}
//         >
//           <option value="LOW">Low</option>
//           <option value="MEDIUM">Medium</option>
//           <option value="HIGH">High</option>
//           <option value="URGENT">Urgent</option>
//         </select>

//         <button type="button" className="history-button">History</button>

//         <button type="button" onClick={handleSave} className="save-button">Save Task</button>
//       </form>
//     </div>
//   );
// }

// export default TaskDetails;


/////////////////////////////////////////VERSION 4///////////////////////////////////////////


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function TaskDetails() {
  const { id } = useParams();
  const isNewTask = !id;
  const navigate = useNavigate();
  
  const [task, setTask] = useState({
    name: '',
    tags: [],
    description: '',
    stage: 'DEVELOPMENT',
    status: 'IN PROGRESS',
    assignee: '',
    storyPoints: 1,
    typeOfTask: 'Story',
    priority: 'LOW'
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchTask(id);
    }
  }, [id]);

  const fetchTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:3001/tasks/${taskId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch task');
      }
      const data = await response.json();
      setTask(data);
    } catch (error) {
      console.error("Error fetching task:", error);
      setError("Failed to load task. Please try again.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const url = isNewTask ? 'http://localhost:3001/tasks' : `http://localhost:3001/tasks/${id}`;
      const method = isNewTask ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error('Failed to save task');
      }

      // Successfully saved, navigate to Product Backlog
      navigate('/');
    } catch (error) {
      console.error("Error saving task:", error);
      setError("Failed to save task. Please try again.");
    }
  };

  const toggleStage = () => {
    const stages = ['PLANNING', 'DEVELOPMENT', 'TESTING', 'INTEGRATION'];
    const currentIndex = stages.indexOf(task.stage);
    const nextIndex = (currentIndex + 1) % stages.length;
    setTask({ ...task, stage: stages[nextIndex] });
  };

  const toggleStatus = () => {
    const statuses = ['STARTED', 'IN PROGRESS', 'COMPLETED'];
    const currentIndex = statuses.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    setTask({ ...task, status: statuses[nextIndex] });
  };

  const addTag = (tag) => {
    if (!task.tags.includes(tag)) {
      setTask({ ...task, tags: [...task.tags, tag] });
    }
  };

  const removeTag = (tagToRemove) => {
    setTask({ ...task, tags: task.tags.filter(tag => tag !== tagToRemove) });
  };

  return (
    <div className="task-details">
      <h2>{isNewTask ? 'New Task' : 'Edit Task'}</h2>

      {error && <div className="error">{error}</div>}

      <form>
        <input
          type="text"
          placeholder="Task Name"
          value={task.name}
          onChange={(e) => setTask({ ...task, name: e.target.value })}
        />

        <div className="tags-container">
          {task.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
              <button type="button" onClick={() => removeTag(tag)}>x</button>
            </span>
          ))}
        </div>
        <div className="tag-buttons">
          {['frontend', 'UI/UX', 'database', 'backend', 'testing', 'API'].map((tag) => (
            <button key={tag} type="button" onClick={() => addTag(tag)}>+ {tag}</button>
          ))}
        </div>

        <textarea
          placeholder="Task Description"
          value={task.description}
          onChange={(e) => setTask({ ...task, description: e.target.value })}
        />

        <button type="button" onClick={toggleStage} className="stage-button">{task.stage}</button>
        <button type="button" onClick={toggleStatus} className={`status-button ${task.status.toLowerCase().replace(' ', '-')}`}>{task.status}</button>

        <input
          type="text"
          placeholder="Assignee"
          value={task.assignee}
          onChange={(e) => setTask({ ...task, assignee: e.target.value })}
        />

        <div className="story-points">
          <label>Story Points: {task.storyPoints}</label>
          <input
            type="range"
            min="1"
            max="10"
            value={task.storyPoints}
            onChange={(e) => setTask({ ...task, storyPoints: parseInt(e.target.value) })}
          />
        </div>

        <div className="type-of-task">
          <label>
            <input
              type="radio"
              value="Story"
              checked={task.typeOfTask === 'Story'}
              onChange={(e) => setTask({ ...task, typeOfTask: e.target.value })}
            /> Story
          </label>
          <label>
            <input
              type="radio"
              value="Bug"
              checked={task.typeOfTask === 'Bug'}
              onChange={(e) => setTask({ ...task, typeOfTask: e.target.value })}
            /> Bug
          </label>
        </div>

        <select
          value={task.priority}
          onChange={(e) => setTask({ ...task, priority: e.target.value })}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>

        <button type="button" className="history-button">History</button>

        <button type="button" onClick={handleSave} className="save-button">Save Task</button>
      </form>
    </div>
  );
}

export default TaskDetails;
