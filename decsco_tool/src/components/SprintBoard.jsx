import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SprintModal from './SprintModal';
import './SprintBoard.css';

const SprintBoard = () => {
  const [sprints, setSprints] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load sprints from localStorage
    const storedSprints = JSON.parse(localStorage.getItem('sprints')) || [];
    setSprints(storedSprints);
  }, []);

  const handleCreateSprint = (newSprint) => {
    const updatedSprints = [...sprints, newSprint];
    setSprints(updatedSprints);
    localStorage.setItem('sprints', JSON.stringify(updatedSprints));
    setShowCreateModal(false);
  };

  const handleAddTasks = (sprintId) => {
    navigate(`/sprint/${sprintId}/select-tasks`);
  };

  return (
    <div className="sprint-board">
      <header>
        <h1>Sprint Board</h1>
        <button className="create-sprint-btn" onClick={() => setShowCreateModal(true)}>
          + Create Sprint
        </button>
      </header>
      <table className="sprint-table">
        <thead>
          <tr>
            <th>Sprint</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sprints.map((sprint) => (
            <tr key={sprint.id}>
              <td>
                <Link to={`/sprint/${sprint.id}`}>{sprint.name}</Link>
              </td>
              <td>{sprint.startDate}</td>
              <td>{sprint.endDate}</td>
              <td>{sprint.status}</td>
              <td>
                <button onClick={() => handleAddTasks(sprint.id)}>Add Tasks</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showCreateModal && (
        <SprintModal
          onSave={handleCreateSprint}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default SprintBoard;



// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import SprintModal from './SprintModal';
// import './SprintBoard.css';

// const SprintBoard = () => {
//   const [sprints, setSprints] = useState([]);
//   const [showCreateModal, setShowCreateModal] = useState(false);

//   useEffect(() => {
//     // Load sprints from localStorage
//     const storedSprints = JSON.parse(localStorage.getItem('sprints')) || [];
//     setSprints(storedSprints);
//   }, []);

//   const handleCreateSprint = (newSprint) => {
//     const updatedSprints = [...sprints, newSprint];
//     setSprints(updatedSprints);
//     localStorage.setItem('sprints', JSON.stringify(updatedSprints));
//     setShowCreateModal(false);
//   };

//   return (
//     <div className="sprint-board">
//       <h1>Sprint Board</h1>
//       <button className="create-sprint-btn" onClick={() => setShowCreateModal(true)}>
//         Create Sprint
//       </button>
//       <table className="sprint-table">
//         <thead>
//           <tr>
//             <th>Sprint</th>
//             <th>Start Date</th>
//             <th>End Date</th>
//             <th>Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {sprints.map((sprint) => (
//             <tr key={sprint.id}>
//               <td>
//                 <Link to={`/sprint/${sprint.id}`}>{sprint.name}</Link>
//               </td>
//               <td>{sprint.startDate}</td>
//               <td>{sprint.endDate}</td>
//               <td>{sprint.status}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       {showCreateModal && (
//         <SprintModal
//           onSave={handleCreateSprint}
//           onClose={() => setShowCreateModal(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default SprintBoard;