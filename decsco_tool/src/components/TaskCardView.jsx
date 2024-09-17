// TaskCardView.jsx
import React from 'react';
import './TaskCardView.css';

const TaskCardView = ({ task }) => {
  return (
    <div className={`task-card ${task.priority.toLowerCase()}`}>
      <div className="priority-tag">
        <span className="tag">{task.priority.toUpperCase()}</span>
      </div>
      <h3>{task.name}</h3>
      <div className="story-points">
        <span>Story Points: {task.storyPoint}</span>
      </div>
      <div className="tags">
        {task.tags.map((tag, index) => (
          <span key={index} className="tag">{tag}</span>
        ))}
      </div>
    </div>
  );
};

export default TaskCardView;