import React, { useState, useEffect, useRef } from 'react';
import Choices from 'choices.js';
import 'choices.js/public/assets/styles/choices.min.css';
import './SprintTaskDetails.css';

const SprintTaskDetails = ({ task, onSave, onClose }) => {
  const [editedTask, setEditedTask] = useState(task);
  const tagsRef = useRef(null);

  useEffect(() => {
    setEditedTask(task);

    if (tagsRef.current) {
      const allTags = [
        { value: 'Frontend', label: 'FRONTEND' },
        { value: 'UI/UX', label: 'UI/UX' },
        { value: 'Backend', label: 'BACKEND' },
        { value: 'Database', label: 'DATABASE' },
        { value: 'Testing', label: 'TESTING' },
        { value: 'API', label: 'API' },
      ];

      const choices = new Choices(tagsRef.current, {
        removeItemButton: true,
        duplicateItemsAllowed: false,
        searchEnabled: true,
        shouldSort: false,
        placeholderValue: 'Select tags',
        maxItemCount: -1,
      });

      choices.clearStore();

      const choicesList = allTags.map(tag => ({
        value: tag.value,
        label: tag.label,
        selected: task.tags.includes(tag.value),
      }));

      choices.setChoices(choicesList, 'value', 'label', false);

      tagsRef.current.addEventListener('change', function () {
        const selectedTags = choices.getValue(true);
        setEditedTask((prevTask) => ({ ...prevTask, tags: selectedTags }));
      });

      return () => {
        choices.destroy();
      };
    }
  }, [task]);

  useEffect(() => {
    const prioritySelect = document.getElementById('priority');
    const statusSelect = document.getElementById('taskStatus');
    const personSelect = document.getElementById('personInCharge');
    const stageSelect = document.getElementById('stageOfTask');

    const applySelectStyling = (select, classPrefix) => {
      if (select) {
        select.addEventListener('change', () => {
          select.className = '';
          select.classList.add(`${classPrefix}-${select.value.toLowerCase().replace(' ', '')}`);
        });
        select.dispatchEvent(new Event('change'));
      }
    };

    applySelectStyling(prioritySelect, 'priority');
    applySelectStyling(statusSelect, 'status');
    applySelectStyling(personSelect, 'person');
    applySelectStyling(stageSelect, 'stage');
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prevTask => ({ ...prevTask, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedTask);
  };

  return (
    <div className="sprint-task-details-overlay">
      <div className="sprint-task-details">
        <h2>Sprint Task Details</h2>
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
              multiple={true}
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
            >
              <option value="TO DO">TO DO</option>
              <option value="IN PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="completionTime">Completion Time (minutes):</label>
            <input
              type="number"
              id="completionTime"
              name="completionTime"
              value={Math.round((editedTask.completionTime || 0) / 60000)} // Convert milliseconds to minutes
              onChange={handleChange}
              readOnly
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="save-task">Save Task</button>
            <button type="button" className="cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SprintTaskDetails;

