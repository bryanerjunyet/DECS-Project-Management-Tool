import React, { useState } from 'react';
import Choices from 'choices.js';
import 'choices.js/public/assets/styles/choices.min.css';
import './TaskCardForm.css';

const TaskCardForm = ({ onSubmit, onCancel }) => {
  const [task, setTask] = useState({
    name: '',
    tags: [],
    description: '',
    personInCharge: 'Alvin',
    priority: 'LOW',
    storyPoint: 1,
    typeOfTask: 'Story',
    stageOfTask: 'PLANNING',
    taskStatus: 'TO DO'
  });

  // const tagsRef = useRef(null);

  // useEffect(() => {
  //   const choices = new Choices(tagsRef.current, {
  //     removeItemButton: true,
  //     duplicateItemsAllowed: false,
  //   });

  //   return () => {
  //     choices.destroy();
  //   };
  // }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask(prevTask => ({ ...prevTask, [name]: value }));
  };

  const handleTagChange = (selectedTags) => {
    setTask(prevTask => ({ ...prevTask, tags: selectedTags }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...task, id: Date.now() });
  };

  return (
    <div className="task-card-form-overlay">
      <form className="task-card-form" onSubmit={handleSubmit}>
        <h1>Create New Task</h1>
        
        <div className="form-field">
          <label htmlFor="name">Task Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={task.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="tags">Tags:</label>
          <select
            id="tags"
            name="tags"
            multiple
            value={task.tags}
            onChange={(e) => handleTagChange(Array.from(e.target.selectedOptions, option => option.value))}
          >
            <option value="Frontend">FRONTEND</option>
            <option value="UI/UX">UI/UX</option>
            <option value="Backend">BACKEND</option>
            <option value="Database">DATABASE</option>
            <option value="Testing">TESTING</option>
            <option value="API">API</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={task.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label htmlFor="personInCharge">Person in Charge:</label>
          <select
            id="personInCharge"
            name="personInCharge"
            value={task.personInCharge}
            onChange={handleChange}
            className={`person-${task.personInCharge.toLowerCase()}`}
          >
            <option value="Alvin">ALVIN</option>
            <option value="Bryan">BRYAN</option>
            <option value="Joey">JOEY</option>
            <option value="Shelly">SHELLY</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="priority">Priority:</label>
          <select
            id="priority"
            name="priority"
            value={task.priority}
            onChange={handleChange}
            className={`priority-${task.priority.toLowerCase()}`}
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="storyPoint">Story Point:</label>
          <input
            type="range"
            id="storyPoint"
            name="storyPoint"
            min="1"
            max="10"
            value={task.storyPoint}
            onChange={handleChange}
            className="slider"
          />
          <div className="slider-labels">
            {[...Array(10)].map((_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
        </div>

        <div className="form-field">
          <label>Type of Task:</label>
          <div className="type-of-task">
            <label>
              <input
                type="radio"
                name="typeOfTask"
                value="Story"
                checked={task.typeOfTask === 'Story'}
                onChange={handleChange}
              /> Story
            </label>
            <label>
              <input
                type="radio"
                name="typeOfTask"
                value="Bug"
                checked={task.typeOfTask === 'Bug'}
                onChange={handleChange}
              /> Bug
            </label>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="stageOfTask">Stage of Task:</label>
          <select
            id="stageOfTask"
            name="stageOfTask"
            value={task.stageOfTask}
            onChange={handleChange}
            className={`stage-${task.stageOfTask.toLowerCase()}`}
          >
            <option value="PLANNING">PLANNING</option>
            <option value="DEVELOPMENT">DEVELOPMENT</option>
            <option value="TESTING">TESTING</option>
            <option value="INTEGRATION">INTEGRATION</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="taskStatus">Task Status:</label>
          <select
            id="taskStatus"
            name="taskStatus"
            value={task.taskStatus}
            onChange={handleChange}
            className={`status-${task.taskStatus.toLowerCase().replace(' ', '')}`}
          >
            <option value="TO DO">TO DO</option>
            <option value="IN PROGRESS">IN PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-task">Save Task</button>
          <button type="button" className="cancel" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default TaskCardForm;



// import React, { useState } from 'react';
// import './TaskCardForm.css';

// const TaskCardForm = ({ onSubmit, onCancel }) => {
//   const [task, setTask] = useState({
//     name: '',
//     priority: 'medium',
//     storyPoint: '',
//     tags: [],
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setTask(prevTask => ({ ...prevTask, [name]: value }));
//   };

//   const handleTagChange = (e) => {
//     const tags = e.target.value.split(',').map(tag => tag.trim());
//     setTask(prevTask => ({ ...prevTask, tags }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSubmit({ ...task, id: Date.now() });
//   };

//   return (
//     <div className="task-card-form-overlay">
//       <form className="task-card-form" onSubmit={handleSubmit}>
//         <h2>New Task</h2>
//         <div className="form-field">
//           <label htmlFor="name">Task Name:</label>
//           <input
//             type="text"
//             id="name"
//             name="name"
//             value={task.name}
//             onChange={handleChange}
//             required
//           />
//         </div>
//         <div className="form-field">
//           <label htmlFor="priority">Priority:</label>
//           <select
//             id="priority"
//             name="priority"
//             value={task.priority}
//             onChange={handleChange}
//           >
//             <option value="low">Low</option>
//             <option value="medium">Medium</option>
//             <option value="high">High</option>
//             <option value="urgent">Urgent</option>
//           </select>
//         </div>
//         <div className="form-field">
//           <label htmlFor="storyPoint">Story Points:</label>
//           <input
//             type="number"
//             id="storyPoint"
//             name="storyPoint"
//             value={task.storyPoint}
//             onChange={handleChange}
//             required
//           />
//         </div>
//         <div className="form-field">
//           <label htmlFor="tags">Tags (comma-separated):</label>
//           <input
//             type="text"
//             id="tags"
//             name="tags"
//             value={task.tags.join(', ')}
//             onChange={handleTagChange}
//           />
//         </div>
//         <div className="form-actions">
//           <button type="submit" className="save-task">Save Task</button>
//           <button type="button" className="cancel" onClick={onCancel}>Cancel</button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default TaskCardForm;


// // import React, { useEffect, useState } from 'react';
// // import NavigationSidebar from './NavigationSidebar';

// // const TaskForm = () => {
// //     //   const [tasks, setTasks] = useState([]);
    
// //     //   useEffect(() => {
// //     //     // Load tasks from local storage
// //     //     const loadedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
// //     //     setTasks(loadedTasks);
// //     //   }, []);
// //     return (
// //         <body className="product-backlog">
// //             <NavigationSidebar />
// //             <div className="main-content">

// //                 {/* <TaskBoard tasks={tasks} /> */}
// //             </div>
// //         </body>
// //     );
// // };
    
// //     export default TaskForm;