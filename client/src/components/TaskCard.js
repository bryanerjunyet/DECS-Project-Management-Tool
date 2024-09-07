// src/components/TaskCard.js
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