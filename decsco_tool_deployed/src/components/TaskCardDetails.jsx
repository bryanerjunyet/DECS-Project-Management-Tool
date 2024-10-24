import React, { useState, useEffect, useRef } from 'react';
import { PICSelection } from './PICManagement';
import Choices from 'choices.js';
import 'choices.js/public/assets/styles/choices.min.css';
import './TaskCardDetails.css';
import TaskHistory from './TaskHistory';

const TaskCardDetails = ({ task, onSave, onDelete, onClose, readOnly, currentUser }) => {
  const [editedTask, setEditedTask] = useState(task);
  const [showHistory, setShowHistory] = useState(false);
  const tagsRef = useRef(null);

  useEffect(() => {
    setEditedTask(task);

    if (tagsRef.current && !readOnly) {
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
  }, [task, readOnly]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prevTask => ({ ...prevTask, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!readOnly) {
      onSave(editedTask);
    }
  };

  useEffect(() => {
    const applyDynamicClasses = (elementId, valueProperty, classPrefix) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.className = '';
        element.classList.add(`${classPrefix}-${editedTask[valueProperty].toLowerCase().replace(' ', '')}`);
      }
    };

    applyDynamicClasses('priority', 'priority', 'priority');
    applyDynamicClasses('taskStatus', 'taskStatus', 'status');
    applyDynamicClasses('personInCharge', 'personInCharge', 'person');
  }, [editedTask]);

  return (
    <div className="task-card-details-overlay">
      <div className="task-card-details">
        <div className="task-card-header">
          <h1>
            Task Details
          </h1>
          <button className="history-button" onClick={() => setShowHistory(true)}>History</button>
        </div>
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
              readOnly={readOnly}
            />
          </div>

          <div className="form-field">
            <label htmlFor="tags">Tags:</label>
            {readOnly ? (
              <div>{editedTask.tags.join(', ')}</div>
            ) : (
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
            )}
          </div>

          <div className="form-field">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={editedTask.description}
              onChange={handleChange}
              readOnly={readOnly}
            />
          </div>

          <div className="form-field">
            <label htmlFor="personInCharge">Person in Charge:</label>
              {readOnly ? (
                <div id="personInCharge" className="person">
                  {editedTask.personInCharge}
                </div>
              ) : (
                <PICSelection
                  id="personInCharge"
                  name="personInCharge"
                  value={editedTask.personInCharge}
                  onChange={handleChange}
                  className="person"
                />
              )}
          </div>

          <div className="form-field">
            <label htmlFor="priority">Priority:</label>
            {readOnly ? (
              <div id="priority" className={`priority-${editedTask.priority.toLowerCase()}`}>
                {editedTask.priority}
              </div>
            ) : (
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
            )}
          </div>

          <div className="form-field">
            <label htmlFor="storyPoint">Story Point:</label>
            {readOnly ? (
              <div>{editedTask.storyPoint}</div>
            ) : (
              <>
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
              </>
            )}
          </div>

          <div className="form-field">
            <label>Type of Task:</label>
            {readOnly ? (
              <div>{editedTask.typeOfTask}</div>
            ) : (
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
            )}
          </div>

          <div className="form-field">
            <label htmlFor="stageOfTask">Stage of Task:</label>
            {readOnly ? (
              <div className={`stage-${editedTask.stageOfTask.toLowerCase()}`}>
                {editedTask.stageOfTask}
              </div>
            ) : (
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
            )}
          </div>

          <div className="form-field">
            <label htmlFor="taskStatus">Task Status:</label>
            {readOnly ? (
              <div id="taskStatus" className={`status-${editedTask.taskStatus.toLowerCase().replace(' ', '')}`}>
                {editedTask.taskStatus}
              </div>
            ) : (
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
            )}
          </div>
          <div className="form-actions">
            {!readOnly && (
              <>
                <button type="submit" className="save-task">Save Task</button>
                <button type="button" className="delete-task" onClick={() => onDelete(editedTask.id)}>Delete Task</button>
              </>
            )}
            <button type="button" className="cancel" onClick={onClose}>
              {readOnly ? 'Close' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
      {showHistory && (
        <TaskHistory
          history={editedTask.history || []}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};

export default TaskCardDetails;