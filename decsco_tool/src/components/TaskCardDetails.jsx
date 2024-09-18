import React, { useState, useEffect } from 'react';
import './TaskCardDetails.css';

const TaskCardDetails = ({ task, onSave, onDelete, onClose }) => {
  const [editedTask, setEditedTask] = useState(task);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prevTask => ({ ...prevTask, [name]: value }));
  };

  const handleTagChange = (selectedTags) => {
    setEditedTask(prevTask => ({ ...prevTask, tags: selectedTags }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedTask);
  };

  return (
    <div className="task-card-details-overlay">
      <div className="task-card-details">
        <h1>Task Details</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="name">Task Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={editedTask.name}
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
              value={editedTask.tags}
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
              value={editedTask.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="personInCharge">Person in Charge:</label>
            <select
              id="personInCharge"
              name="personInCharge"
              value={editedTask.personInCharge}
              onChange={handleChange}
              className={`person-${editedTask.personInCharge.toLowerCase()}`}
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
              value={editedTask.priority}
              onChange={handleChange}
              className={`priority-${editedTask.priority.toLowerCase()}`}
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
              value={editedTask.storyPoint}
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
                  checked={editedTask.typeOfTask === 'Story'}
                  onChange={handleChange}
                /> Story
              </label>
              <label>
                <input
                  type="radio"
                  name="typeOfTask"
                  value="Bug"
                  checked={editedTask.typeOfTask === 'Bug'}
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
              value={editedTask.stageOfTask}
              onChange={handleChange}
              className={`stage-${editedTask.stageOfTask.toLowerCase()}`}
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
              value={editedTask.taskStatus}
              onChange={handleChange}
              className={`status-${editedTask.taskStatus.toLowerCase().replace(' ', '')}`}
            >
              <option value="TO DO">TO DO</option>
              <option value="IN PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-task">Save Task</button>
            <button type="button" className="delete-task" onClick={() => onDelete(editedTask.id)}>Delete Task</button>
            <button type="button" className="cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCardDetails;