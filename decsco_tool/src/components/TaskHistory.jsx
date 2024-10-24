import React, { useState, useEffect } from 'react';
import './TaskHistory.css';

const TaskHistory = ({ task_id, onClose }) => {
  const [history, setHistory] = useState([]);
  useEffect(() => {
    loadHistory(task_id);
  }, [task_id]);

  const loadHistory = async () => {
    try {
      // Retrieve task history from database
      const response = await fetch(`http://localhost:3001/tasks/history?task_id=${task_id}`, {
        method: 'GET'
      });

      // Sets current history to empty if there are no task history entries
      if (response.status === 204) {
        setHistory([]);
        return;
      } else if (!response.ok) {
        throw new Error('Unable to retrieve  task history from database.');
      }
      const jsonData = await response.json();

      const storedHistory = jsonData.rows;

      const processedHistory = storedHistory.map(entry => {
        const [date, time] = entry.histentry_date.split('T');
        return {...entry,
          date: date,
          time: time.split('.')[0]
        }
      });
      
      setHistory(processedHistory);
    } catch (err) {
      console.error('Error fetching task history:', err);
    }
  };
  return (
    <div className="task-history-overlay">
      <div className="task-history-content">
        <h2>Task History</h2>
        <table className="task-history-table">
          <thead>
            <tr>
              <th>History</th>
              <th>Editor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, index) => (
              <tr key={index}>
                <td>{entry.description}</td>
                <td>{entry.user_name}</td>
                <td>{entry.date}</td>
                <td>{entry.time}</td>
                <td>{entry.status_name}</td>
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