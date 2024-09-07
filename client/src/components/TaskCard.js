// // src/components/TaskCard.js
// import React from 'react';

// function TaskCard({ task, onClick }) {
//   return (
//     <div className="task-card" onClick={onClick}>
//       <h3>{task.name}</h3>
//       {/* Display other task details like tags, status, etc. */}
//     </div>
//   );
// }

// export default TaskCard;


///////////////////////////////////VERSION 2/////////////////////////////////////////


// // src/components/TaskCard.js
// import React from 'react';

// function TaskCard({ task, onClick }) {
//   return (
//     <div className="task-card" onClick={onClick}>
//       <h2>{task.name}</h2>
//       <p>Status: {task.status}</p>
//       <p>Stage: {task.stage}</p>
//     </div>
//   );
// }

// export default TaskCard;



////////////////////////////////////VERSION 3/////////////////////////////////////////////


import React from 'react';

function TaskCard({ task, onClick }) {
  return (
    <div className={`task-card ${task.priority.toLowerCase()}`} onClick={onClick}>
      <h2>{task.name}</h2>
      <p className="priority">{task.priority}</p>
      <p>Story Points: {task.storyPoints}</p>
      <div className="tags">
        {task.tags.map((tag, index) => (
          <span key={index} className="tag">{tag}</span>
        ))}
      </div>
    </div>
  );
}

export default TaskCard;


import React from 'react';