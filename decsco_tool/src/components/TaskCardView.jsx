// TaskCardView.jsx
import React from 'react';
import './TaskCardView.css';

const TaskCardView = ({ task, onClick }) => {
  return (
    <div 
      className={`task-card ${task.priority_name.toLowerCase()}`} 
      onClick={() => onClick(task)}
    >
      <div className="priority-tag">
        <span className="tag">{task.priority_name.toUpperCase()}</span>
      </div>
      <h3>{task.task_name}</h3>
      <div className="story-points">
        <span>Story Points: {task.story_point}</span>
      </div>
      <div className="tags">
        {task.task_tags.map((tag) => (
          <span key={tag.tasktag_id} className="tag">{tag.tag_name}</span>
        ))}
      </div>
    </div>
  );
};

export default TaskCardView;