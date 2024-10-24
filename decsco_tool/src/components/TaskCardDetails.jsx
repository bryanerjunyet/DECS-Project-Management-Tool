import React, { useState, useEffect, useRef } from 'react';
import Choices from 'choices.js';
import 'choices.js/public/assets/styles/choices.min.css';
import './TaskCardDetails.css';
import TaskHistory from './TaskHistory';

const TaskCardDetails = ({ task, onSave, onDelete, onClose, readOnly, isSprint = false }) => {
  const [editedTask, setEditedTask] = useState(task);
  const [showHistory, setShowHistory] = useState(false);
  const [message, setMessage] = useState('');
  const [manualTime, setManualTime] = useState('');

  const tagsRef = useRef(null);

  const [availableTags, setAvailableTags] = useState([]);
  const [availablePriorities, setAvailablePriorities] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [availableStages, setAvailableStages] = useState([]);
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [lastSavedTime, setLastSavedTime] = useState(task.completionTime ? parseInt(task.completionTime, 10) : 0);
  const [userToken, setUserToken] = useState(null);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    setUserToken(JSON.parse(localStorage.getItem('user')).user_token);
    const fetchData = async (endpoint, setter) => {
      try {
        const response = await fetch(`http://localhost:3001/${endpoint}`);
        if (!response.ok) throw new Error(response.statusText);
        const jsonData = await response.json();
        if (jsonData.rows) setter(jsonData.rows);
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
      }
    };

    fetchData('tasks/tag_lookup', setAvailableTags);
    fetchData('tasks/priority_lookup', setAvailablePriorities);
    fetchData('tasks/type_lookup', setAvailableTypes);
    fetchData('tasks/stage_lookup', setAvailableStages);
    fetchData('tasks/status_lookup', setAvailableStatuses);
    fetchData('users', setAvailableUsers);
  }, []);

  useEffect(() => {
    loadLastSavedTime();
    setElapsedTime(lastSavedTime);
    setEditedTask(task);

    if (tagsRef.current && !readOnly) {
      const choices = new Choices(tagsRef.current, {
        removeItemButton: true,
        duplicateItemsAllowed: false,
        searchEnabled: true,
        shouldSort: false,
        placeholderValue: 'Select tags',
        maxItemCount: -1,
      });

      choices.clearStore();

      const choicesList = availableTags.map(tag => ({
        value: tag.tasktag_id,
        label: tag.tag_name,
        selected: task.task_tags.some(tagObj => tagObj.tasktag_id === tag.tasktag_id),
      }));

      choices.setChoices(choicesList, 'value', 'label', false);

      tagsRef.current.addEventListener('change', function () {
        const selectedTags = choices.getValue(true);
        setEditedTask((prevTask) => ({ ...prevTask, task_tags: selectedTags }));
      });

      return () => {
        choices.destroy();
      };
    }
  }, [task, availableTags, readOnly]);

  const loadLastSavedTime = async () => {
    try {
      const response = await fetch(`http://localhost:3001/sprints/tasks/time?user_token=${JSON.parse(localStorage.getItem("user")).user_token}&task_id=${task.task_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLastSavedTime(data.reduce((total, item) => total + item.time_taken, 0));
      } else {
        throw new Error(`Status ${response.status} - Error with time data fetch request`)
      }
    } catch (err) {
      console.error('Error loading task time data:', err);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prevTask => ({ ...prevTask, [name]: value }));
  };

  const handleUserChange = (e) => {
    const userToken = e.target.value;
    const selectedUser = availableUsers.find(user => user.user_id === userToken);
  
    setEditedTask((prevTask) => ({
      ...prevTask,
      user_token: userToken,
      user_name: selectedUser ? selectedUser.user_name : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedTask = {
      ...editedTask,
      id: Date.now(),
      taskpriority_id: parseInt(editedTask.taskpriority_id, 10),
      story_point: parseInt(editedTask.story_point, 10),
      tasktype_id: parseInt(editedTask.tasktype_id, 10),
      taskstage_id: parseInt(editedTask.taskstage_id, 10),
      taskstatus_id: parseInt(editedTask.taskstatus_id, 10),
      task_tags: editedTask.task_tags.map(tag => {
        if (typeof tag === 'object' && tag !== null && tag.tasktag_id !== undefined) {
          return parseInt(tag.tasktag_id, 10);
        }
        if (Number.isInteger(tag)) {
          return tag;
        }
        return null;
      })
    };

    try {
      await onSave(updatedTask);
      await saveTime();
      setMessage('Task saved successfully!');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Failed to save task:', error);
      setMessage('Failed to save task. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const saveTime = async() => {
    try {
      const totalTime = elapsedTime - lastSavedTime;
      const response = await fetch(`http://localhost:3001/sprints/tasks/time`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_token: JSON.parse(localStorage.getItem("user")).user_token,
          task_id: task.task_id,
          time_taken: totalTime
        })
      });
      if (!response.ok) {
        throw new Error(`Status ${response.status} - Error with posting task time`)
      }
    } catch (error) {
      console.error('Error with saving task time:', error);
    }
  };

  const formatTime = (s) => {
    // const seconds = Math.floor(ms / 1000);
    // const minutes = Math.floor(seconds / 60);
    // const hours = Math.floor(minutes / 60);
    console.log(`s: ${s}`)
    const seconds = s % 60;
    const minutes = Math.floor(s / 60) % 60
    const hours = Math.floor(s / 3600);
    console.log(seconds, minutes, hours)
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const handleAddTime = () => {
    const [hours, minutes, seconds] = manualTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      setMessage('Invalid time format. Please use HH:MM:SS.');
      setTimeout(() => setMessage(''), 5000);
      return;
    }
    const additionalSeconds = hours * 3600 + minutes * 60 + seconds;
    const newElapsedTime = elapsedTime + additionalSeconds;
    setElapsedTime(newElapsedTime);
    setManualTime('');
    const timeLogged = formatTime(additionalSeconds);
    setMessage(`Successfully added ${timeLogged} to the task.`);
    setTimeout(() => setMessage(''), 5000);
    addHistoryEntry(`Manually added time: ${timeLogged}`, 2);
  };

  const addHistoryEntry = async (description, status_id) => {
    try {
      const histEntry = {
        task_id: task.task_id,
        description: description,
        user_token: userToken,
        status_id: status_id
      };
      const response = await fetch(`http://localhost:3001/tasks/history?task_id=${task.task_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(histEntry)
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
    } catch (error) {
      console.error('Failed to add history entry:', error);
    }
  };

  const getPriorityClass = (priorityId) => {
    switch (parseInt(priorityId)) {
      case 1: return 'priority-low';
      case 2: return 'priority-medium';
      case 3: return 'priority-high';
      case 4: return 'priority-urgent';
      default: return '';
    }
  };

  const getStatusClass = (statusId) => {
    switch (parseInt(statusId)) {
      case 1: return 'status-todo';
      case 2: return 'status-inprogress';
      case 3: return 'status-completed';
      default: return '';
    }
  };

  return (
    <div className="task-card-details-overlay">
      <div className="task-card-details">
        <div className="task-card-header">
          <h1>Task Details</h1>
          <button className="history-button" onClick={() => setShowHistory(true)}>History</button>
        </div>
        {message && <div className="message">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="name">Task Name:</label>
            <input
              type="text"
              id="name"
              name="task_name"
              value={editedTask.task_name}
              onChange={handleChange}
              required
              readOnly={readOnly}
            />
          </div>
  
          <div className="form-field">
            <label htmlFor="tags">Tags:</label>
            {readOnly ? (
              <div>{editedTask.task_tags.map(tag => tag.tag_name).join(', ')}</div>
            ) : (
              <select
                id="tags"
                name="tags"
                ref={tagsRef}
                className="choices-multiple"
                multiple={true}
              >
                {availableTags.map(tag => (
                  <option key={tag.tasktag_id} value={tag.tasktag_id}>{tag.tag_name}</option>
                ))}
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
              <div id="personInCharge" className={`person-${editedTask.user_name ? editedTask.user_name.toLowerCase() : 'none'}`}>
                {editedTask.user_name}
              </div>
            ) : (
              <select
                id="personInCharge"
                name="user_token"
                value={editedTask.user_token}
                onChange={handleUserChange}
                className={`person-${editedTask.user_name ? editedTask.user_name.toLowerCase() : 'none'}`}
              >
                <option value={null}>None</option>
                {availableUsers.map(user => (
                  <option key={user.user_id} value={user.user_id}>{user.user_name}</option>
                ))}
              </select>
            )}
          </div>
  
          <div className="form-field">
            <label htmlFor="priority">Priority:</label>
            {readOnly ? (
              <div id="priority" className={`priority ${getPriorityClass(editedTask.taskpriority_id)}`}>
                {editedTask.priority_name}
              </div>
            ) : (
              <select
                id="priority"
                name="taskpriority_id"
                value={editedTask.taskpriority_id}
                onChange={handleChange}
                className={`priority ${getPriorityClass(editedTask.taskpriority_id)}`}
              >
                {availablePriorities.map(priority => (
                  <option key={priority.taskpriority_id} value={priority.taskpriority_id}>{priority.priority_name}</option>
                ))}
              </select>
            )}
          </div>
  
          <div className="form-field">
            <label htmlFor="storyPoint">Story Point:</label>
            {readOnly ? (
              <div>{editedTask.story_point}</div>
            ) : (
              <>
                <input
                  type="range"
                  id="storyPoint"
                  name="story_point"
                  min="1"
                  max="10"
                  value={editedTask.story_point}
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
              <div>{editedTask.type_name}</div>
            ) : (
              <div className="type-of-task">
                {availableTypes.map((type) => (
                  <label key={type.tasktype_id}>
                    <input
                      type="radio"
                      name="tasktype_id"
                      value={type.tasktype_id}
                      checked={editedTask.tasktype_id === type.tasktype_id.toString()}
                      onChange={handleChange}
                      />{' '}
                      {type.type_name}
                    </label>
                  ))}
                </div>
              )}
            </div>
    
            <div className="form-field">
              <label htmlFor="stageOfTask">Stage of Task:</label>
              {readOnly ? (
                <div className={`stage-${editedTask.taskstage_id}`}>
                  {editedTask.stage_name}
                </div>
              ) : (
                <select
                  id="stageOfTask"
                  name="taskstage_id"
                  value={editedTask.taskstage_id}
                  onChange={handleChange}
                  className={`stage-${editedTask.taskstage_id}`}
                >
                  {availableStages.map(stage => (
                    <option key={stage.taskstage_id} value={stage.taskstage_id}>{stage.stage_name}</option>
                  ))}
                </select>
              )}
            </div>
    
            <div className="form-field">
              <label htmlFor="taskStatus">Task Status:</label>
              {readOnly ? (
                <div id="taskStatus" className={`status ${getStatusClass(editedTask.taskstatus_id)}`}>
                  {editedTask.status_name}
                </div>
              ) : (
                <select
                  id="taskStatus"
                  name="taskstatus_id"
                  value={editedTask.taskstatus_id}
                  onChange={handleChange}
                  className={`status ${getStatusClass(editedTask.taskstatus_id)}`}
                >
                  {availableStatuses.map(status => (
                    <option key={status.taskstatus_id} value={status.taskstatus_id}>{status.status_name}</option>
                  ))}
                </select>
              )}
            </div>
    
            <div className="form-field">
            <label htmlFor="completionTime">Completion Time:</label>
            <input
              type="text"
              id="completionTime"
              name="completionTime"
              value={formatTime(elapsedTime)}
              readOnly
            />
          </div>
  
          <div className="form-field">
            <label htmlFor="manualTime">Add Time (HH:MM:SS):</label>
            <div className="add-time-container">
              <input
                type="text"
                id="manualTime"
                value={manualTime}
                onChange={(e) => setManualTime(e.target.value)}
                placeholder="HH:MM:SS"
              />
              <button type="button" onClick={handleAddTime} className="add-time-button">Add Time</button>
            </div>
          </div>
    
          <div className="form-actions">
            {!readOnly && (
              <>
                <button type="submit" className="save-task">Save Task</button>
                <button type="button" className="delete-task" onClick={() => onDelete(editedTask.task_id)}>Delete Task</button>
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
          task_id={task.task_id}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}

export default TaskCardDetails;