import React, { useState, useEffect, useRef, useCallback } from 'react';
import Choices from 'choices.js';
import 'choices.js/public/assets/styles/choices.min.css';
import './SprintTaskDetails.css';
import TaskHistory from './TaskHistory';

const SprintTaskDetails = ({ task, onSave, onClose, currentUser }) => {
  const [editedTask, setEditedTask] = useState(task);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(task.completionTime || 0);
  const [showHistory, setShowHistory] = useState(false);
  const [taskHistory, setTaskHistory] = useState(task.history || []);
  const [message, setMessage] = useState('');
  const tagsRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'TO DO':
        return '#2196F3';
      case 'IN PROGRESS':
        return '#FFA500';
      case 'COMPLETED':
        return '#4CAF50';
      default:
        return '#000000'; // Default color
    }
  };

  useEffect(() => {
    setEditedTask(task);
    setElapsedTime(task.completionTime || 0);
    setTaskHistory(task.history || []);

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
    const applySelectStyling = (selectId, classPrefix) => {
      const select = document.getElementById(selectId);
      if (select) {
        select.addEventListener('change', () => {
          select.className = '';
          select.classList.add(`${classPrefix}-${select.value.toLowerCase().replace(' ', '')}`);
          if (selectId === 'taskStatus') {
            select.style.backgroundColor = getStatusColor(select.value);
            select.style.color = 'white';
          }
        });
        select.dispatchEvent(new Event('change'));
      }
    };

    applySelectStyling('priority', 'priority');
    applySelectStyling('taskStatus', 'status');
    applySelectStyling('personInCharge', 'person');
    applySelectStyling('stageOfTask', 'stage');
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prevTask => ({ ...prevTask, [name]: value }));
    if (name === 'taskStatus') {
      const select = e.target;
      select.style.backgroundColor = getStatusColor(value);
      select.style.color = 'white';
    }
  };

  const addHistoryEntry = useCallback((activity) => {
    const now = new Date();
    const newEntry = {
      staff: currentUser.username,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      activity: activity,
    };
    console.log(newEntry);
    setTaskHistory(prevHistory => [...prevHistory, newEntry]);
  }, [currentUser.username]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const hasChanges = JSON.stringify(editedTask) !== JSON.stringify(task);
    console.log(hasChanges);
    if (hasChanges) {
      const updatedHistory = [
        ...taskHistory,
        {
          staff: currentUser.username,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          activity: 'Edited'
        }
      ];
      setTaskHistory(updatedHistory);
      onSave({ ...editedTask, completionTime: elapsedTime, history: updatedHistory });
    } else {
      onSave({ ...editedTask, completionTime: elapsedTime, history: taskHistory });
    }
  };

  const startTimer = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
      startTimeRef.current = Date.now() - elapsedTime;
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTimeRef.current);
      }, 1000);
      addHistoryEntry('In Progress');
    }
  };

  const pauseTimer = () => {
    if (isTimerRunning) {
      clearInterval(timerRef.current);
      setIsTimerRunning(false);
      const timeLogged = formatTime(elapsedTime - (task.completionTime || 0));
      setMessage(`You have successfully logged ${timeLogged} of time spent.`);
      setTimeout(() => setMessage(''), 5000); // Clear message after 5 seconds
    }
  };

  const resumeTimer = () => {
    if (!isTimerRunning) {
      startTimer();
    }
  };

  const completeTask = () => {
    pauseTimer();
    setEditedTask(prevTask => {
      const updatedTask = { ...prevTask, taskStatus: 'COMPLETED' };
      // Force immediate update of the select element
      setTimeout(() => {
        const taskStatusSelect = document.getElementById('taskStatus');
        if (taskStatusSelect) {
          taskStatusSelect.value = 'COMPLETED';
          taskStatusSelect.style.backgroundColor = getStatusColor('COMPLETED');
          taskStatusSelect.style.color = 'white';
        }
      }, 0);
      return updatedTask;
    });
    addHistoryEntry('Completed');
    const timeLogged = formatTime(elapsedTime);
    setMessage(`Task completed! Total time logged: ${timeLogged}`);
    setTimeout(() => setMessage(''), 5000); // Clear message after 5 seconds
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="sprint-task-details-overlay">
      <div className="sprint-task-details">
        <h2>Task Details</h2>
        <button className="history-button" onClick={() => setShowHistory(true)}>History</button>
        {message && <div className="message">{message}</div>}
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
              style={{
                backgroundColor: getStatusColor(editedTask.taskStatus),
                color: 'white'
              }}
            >
              <option value="TO DO">TO DO</option>
              <option value="IN PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
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

          <div className="timer-controls">
            {!isTimerRunning && editedTask.taskStatus !== 'COMPLETED' && (
              <button type="button" onClick={startTimer} className="start-timer">Start Task</button>
            )}
            {isTimerRunning && (
              <button type="button" onClick={pauseTimer} className="pause-timer">Pause Task</button>
            )}
            {editedTask.taskStatus !== 'COMPLETED' && (
              <button type="button" onClick={completeTask} className="complete-task">Complete Task</button>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="save-task">Save Task</button>
            <button type="button" className="cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
      {showHistory && (
        <TaskHistory history={taskHistory} onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
};

export default SprintTaskDetails;