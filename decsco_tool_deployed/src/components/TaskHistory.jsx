import React from 'react';
import './TaskHistory.css';

const TaskHistory = ({ history, onClose }) => {
  return (
    <div className="task-history-overlay">
      <div className="task-history-content">
        <h2>Task History</h2>
        <table className="task-history-table">
          <thead>
            <tr>
              <th>Staff</th>
              <th>Date</th>
              <th>Time</th>
              <th>Activity</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, index) => (
              <tr key={index}>
                <td>{entry.staff}</td>
                <td>{entry.date}</td>
                <td>{entry.time}</td>
                <td>{entry.activity}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="close-history" onClick={onClose}>Return</button>
      </div>
    </div>
  );
};

export default TaskHistory;