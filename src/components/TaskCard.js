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

// src/components/TaskCard.js
import React from 'react';

function TaskCard({ task, onClick }) {
  return (
    <div className="task-card" onClick={onClick}>
      <h2>{task.name}</h2>
      <p>Status: {task.status}</p>
      <p>Stage: {task.stage}</p>
    </div>
  );
}

export default TaskCard;