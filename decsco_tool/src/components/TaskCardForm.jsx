import React, { useState, useEffect, useRef } from 'react';
import Choices from 'choices.js';
import 'choices.js/public/assets/styles/choices.min.css';
import './TaskCardForm.css';

const TaskCardForm = ({ onSubmit, onCancel }) => {
  const [task, setTask] = useState({
    task_name: '',
    task_tags: [],
    description: '',
    user_token: '',
    user_name: '',
    taskpriority_id: '1',
    story_point: '1',
    tasktype_id: '1',
    taskstage_id: '1',
    taskstatus_id: '1',
  });

  const [availableTags, setAvailableTags] = useState([]);
  const [availablePriorities, setAvailablePriorities] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [availableStages, setAvailableStages] = useState([]);
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);

  // Ref for the tags select element
  const tagsRef = useRef(null);

  // Fetch available task options from the database
  useEffect(() => {
    const fetchTags = async () => {
      try {
        // Fetches tag data from database
        const response = await fetch('http://localhost:3001/tasks/tag_lookup');
        if (!response.ok) {
          throw new Error(response.message);
        }

        const jsonData = await response.json();
        if (jsonData.rows) {
          setAvailableTags(jsonData.rows); // Store fetched tags
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    const fetchPriority = async () => {
      try {
        // Fetches priority data from database
        const response = await fetch('http://localhost:3001/tasks/priority_lookup');
        if (!response.ok) {
          throw new Error(response.message);
        }

        const jsonData = await response.json();
        if (jsonData.rows) {
          setAvailablePriorities(jsonData.rows); // Store fetched priorities
        }
      } catch (error) {
        console.error('Error fetching priorities:', error);
      }
    };
    const fetchType = async () => {
      try {
        // Fetches type data from database
        const response = await fetch('http://localhost:3001/tasks/type_lookup');
        if (!response.ok) {
          throw new Error(response.message);
        }

        const jsonData = await response.json();
        if (jsonData.rows) {
          setAvailableTypes(jsonData.rows); // Store fetched types
        }
      } catch (error) {
        console.error('Error fetching types:', error);
      }
    };
    const fetchStage = async () => {
      try {
        // Fetches stage data from database
        const response = await fetch('http://localhost:3001/tasks/stage_lookup');
        if (!response.ok) {
          throw new Error(response.message);
        }

        const jsonData = await response.json();
        if (jsonData.rows) {
          setAvailableStages(jsonData.rows); // Store fetched stages
        }
      } catch (error) {
        console.error('Error fetching stages:', error);
      }
    };
    const fetchStatus = async () => {
      try {
        // Fetches status data from database
        const response = await fetch('http://localhost:3001/tasks/status_lookup');
        if (!response.ok) {
          throw new Error(response.message);
        }

        const jsonData = await response.json();
        if (jsonData.rows) {
          setAvailableStatuses(jsonData.rows); // Store fetched statuses
        }
      } catch (error) {
        console.error('Error fetching statuses:', error);
      }
    };

    const fetchUser = async () => {
      try {
        // Fetches user data from database
        const response = await fetch('http://localhost:3001/users');
        if (!response.ok) {
          throw new Error(response.message);
        }

        const jsonData = await response.json();
        if (jsonData.rows) {
          setAvailableUsers(jsonData.rows); // Store fetched users
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchTags();
    fetchPriority();
    fetchType();
    fetchStage();
    fetchStatus();
    fetchUser();
  }, []);

  // Initialize Choices.js on the tags select field
  useEffect(() => {
    if (tagsRef.current) {
      const choices = new Choices(tagsRef.current, {
        removeItemButton: true, // Allow removing selected tags
        duplicateItemsAllowed: false, // Prevent duplicates
        placeholderValue: 'Select tags', // Placeholder for dropdown
        searchEnabled: true, // Allow searching for tags
        shouldSort: false, // Prevent sorting of tags
        items: [], // Start without any selected tags
      });

      // Sync choices with React state
      tagsRef.current.addEventListener('change', function () {
        const selectedTags = choices.getValue(true); // Get values of the selected tags
        setTask((prevTask) => ({ ...prevTask, task_tags: selectedTags }));
      });

      // Cleanup Choices.js instance on component unmount
      return () => {
        choices.destroy();
      };
    }
  }, [availableTags]);

  const getStatusColor = (status) => {
    switch (status) {
      case '1': return '#2196F3'; // TO DO (Blue)
      case '2': return '#FFA500'; // IN PROGRESS (Orange)
      case '3': return '#4CAF50'; // COMPLETED (Green)
      default: return '#000000';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case '1': return '#4CAF50'; // LOW (Green)
      case '2': return '#2196F3'; // MEDIUM (Blue)
      case '3': return '#e9b759'; // HIGH (Peach)
      case '4': return '#FF0000'; // URGENT (Red)
      default: return '#000000';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask((prevTask) => ({ ...prevTask, [name]: value }));
    if (name === 'taskstatus_id') {
      e.target.style.backgroundColor = getStatusColor(value);
      e.target.style.color = 'white';
    }
    if (name === 'taskpriority_id') {
      e.target.style.backgroundColor = getPriorityColor(value);
      e.target.style.color = 'white';
    }
  };

  const handleUserChange = (e) => {
    const userToken = e.target.value; // Get the selected user ID
    const selectedUser = availableUsers.find(user => user.user_id === userToken); // Find the selected user
  
    setTask((prevTask) => ({
      ...prevTask,
      user_token: userToken,
      user_name: selectedUser ? selectedUser.user_name : ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...task,
      id: Date.now(),
      user_token: task.user_token === '' ? null : task.user_token,
      taskpriority_id: parseInt(task.taskpriority_id, 10),
      story_point: parseInt(task.story_point, 10),
      tasktype_id: parseInt(task.tasktype_id, 10),
      taskstage_id: parseInt(task.taskstage_id, 10),
      taskstatus_id: parseInt(task.taskstatus_id, 10),
      task_tags: task.task_tags.map(tag => parseInt(tag, 10))
    });
  };

  return (
    <div className="task-card-form-overlay">
      <form className="task-card-form" onSubmit={handleSubmit}>
        <h1>Create New Task</h1>

        <div className="form-field">
          <label htmlFor="name">Task Name:</label>
          <input
            type="text"
            id="name"
            name="task_name"
            value={task.task_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="tags">Tags:</label>
          <select
            id="tags"
            name="task_tags"
            ref={tagsRef}
            className="choices-multiple"
            multiple={true} // Set this to true to allow multiple selections
          >
            {availableTags.map(tag => (
              <option key={tag.tasktag_id} value={tag.tasktag_id}>{tag.tag_name}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={task.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label htmlFor="personInCharge">Person in Charge:</label>
          <select
            id="personInCharge"
            name="user_token"
            value={task.user_token}
            onChange={handleUserChange}
            className={`person-${task.user_name.toLowerCase()}`}
          >
            <option value={""}>None</option>
            {availableUsers.map(user => (
              <option key={user.user_id} value={user.user_id}>{user.user_name}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="priority">Priority:</label>
          <select
            id="priority"
            name="taskpriority_id"
            value={task.taskpriority_id}
            onChange={handleChange}
            style={{
              backgroundColor: getPriorityColor(task.taskpriority_id),
              color: 'white'
            }}
          >
            {availablePriorities.map(priority => (
              <option key={priority.taskpriority_id} value={priority.taskpriority_id}>{priority.priority_name}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="storyPoint">Story Point:</label>
          <input
            type="range"
            id="storyPoint"
            name="story_point"
            min="1"
            max="10"
            value={task.story_point}
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
            {availableTypes.map((type) => (
              <label key={type.tasktype_id}>
                <input
                  type="radio"
                  name="tasktype_id"
                  value={type.tasktype_id}
                  checked={task.tasktype_id === type.tasktype_id.toString()}
                  onChange={handleChange}
                />{' '}
                {type.type_name}
              </label>
            ))}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="stageOfTask">Stage of Task:</label>
          <select
            id="stageOfTask"
            name="taskstage_id"
            value={task.taskstage_id}
            onChange={handleChange}
            className={`stage-${task.taskstage_id}`}
          >
            {availableStages.map(stage => (
              <option key={stage.taskstage_id} value={stage.taskstage_id}>{stage.stage_name}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="taskStatus">Task Status:</label>
          <select
            id="taskStatus"
            name="taskstatus_id"
            value={task.taskstatus_id}
            onChange={handleChange}
            style={{
              backgroundColor: getStatusColor(task.taskstatus_id),
              color: 'white'
            }}
          >
            {availableStatuses.map(status => (
              <option key={status.taskstatus_id} value={status.taskstatus_id}>{status.status_name}</option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-task">Save Task</button>
          <button type="button" className="cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskCardForm;
