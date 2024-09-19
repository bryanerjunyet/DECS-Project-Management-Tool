import React, { useState, useEffect, useRef } from 'react';
import Choices from 'choices.js';
import 'choices.js/public/assets/styles/choices.min.css';
import './TaskCardDetails.css';

const TaskCardDetails = ({ task, onSave, onDelete, onClose }) => {
  const [editedTask, setEditedTask] = useState(task);
  const tagsRef = useRef(null); // Reference for the tags select element
  const choicesInstance = useRef(null); // Reference for the Choices.js instance

  useEffect(() => {
    setEditedTask(task);

    if (tagsRef.current) {
      // Initialize Choices.js if not already initialized
      if (!choicesInstance.current) {
        choicesInstance.current = new Choices(tagsRef.current, {
          removeItemButton: true, // Allows removing tags
          duplicateItemsAllowed: false, // No duplicate tags
          searchEnabled: true, // Enable searching for tags
          shouldSort: false, // Do not sort tags
          placeholderValue: 'Select tags', // Placeholder for the dropdown
          maxItemCount: -1, // Allow selecting unlimited tags
        });

        // Sync Choices.js with React state
        tagsRef.current.addEventListener('change', function () {
          const selectedTags = choicesInstance.current.getValue(true); // Get selected tags as array of values
          setEditedTask(prevTask => ({ ...prevTask, tags: selectedTags }));
        });
      }

      // Pre-select tags in Choices.js when task is loaded
      if (task.tags && task.tags.length > 0) {
        choicesInstance.current.clearStore(); // Clear previous choices
        choicesInstance.current.setChoices(task.tags.map(tag => ({ value: tag, label: tag, selected: true })), 'value', 'label', false);
      }
    }

    // Cleanup on component unmount
    return () => {
      if (choicesInstance.current) {
        choicesInstance.current.destroy();
        choicesInstance.current = null;
      }
    };
  }, [task]);

  // Handle changes for other fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prevTask => ({ ...prevTask, [name]: value }));
  };

  // Handle the form submission and save task
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedTask);
  };

  // Dynamic class changes for priority, task status, and person in charge
  useEffect(() => {
    const prioritySelect = document.getElementById('priority');
    const statusSelect = document.getElementById('taskStatus');
    const personSelect = document.getElementById('personInCharge');

    // Apply class for priority based on selection
    if (prioritySelect) {
      prioritySelect.addEventListener('change', () => {
        prioritySelect.className = ''; // Reset class
        prioritySelect.classList.add(`priority-${prioritySelect.value.toLowerCase()}`);
      });
      prioritySelect.dispatchEvent(new Event('change')); // Trigger initial styling
    }

    // Apply class for task status based on selection
    if (statusSelect) {
      statusSelect.addEventListener('change', () => {
        statusSelect.className = ''; // Reset class
        statusSelect.classList.add(`status-${statusSelect.value.toLowerCase().replace(' ', '')}`);
      });
      statusSelect.dispatchEvent(new Event('change')); // Trigger initial styling
    }

    // Apply class for person in charge based on selection
    if (personSelect) {
      personSelect.addEventListener('change', () => {
        personSelect.className = ''; // Reset class
        personSelect.classList.add(`person-${personSelect.value.toLowerCase()}`);
      });
      personSelect.dispatchEvent(new Event('change')); // Trigger initial styling
    }
  }, []);

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
              ref={tagsRef}
              className="choices-multiple"
              multiple={true} // Set this to true to allow multiple selections
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