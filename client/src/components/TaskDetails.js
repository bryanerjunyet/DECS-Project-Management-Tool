import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function TaskDetails({ fetchTaskById, saveNewTask, updateTask }) {
  const { id } = useParams();
  const isNewTask = !id; // Check if it's a new task or an existing one
  const navigate = useNavigate();
  
  const [task, setTask] = useState({
    name: '',
    tags: [],
    description: '',
    stage: 'DEVELOPMENT',
    status: 'IN PROGRESS',
    assignee: '',
    storyPoints: 1,
  });

  // Fetch the task details if editing an existing task
  useEffect(() => {
    if (id) {
      fetchTaskById(id).then(data => {
        setTask(data);
      }).catch(error => {
        console.error("Error fetching task:", error);
      });
    }
  }, [id, fetchTaskById]);

  // Handle Save (Create new task or Update existing task)
  const handleSave = () => {
    if (isNewTask) {
      saveNewTask(task)
        .then(() => {
          navigate('/'); // Redirect to the Product Backlog Dashboard
        })
        .catch(error => {
          console.error("Error saving new task:", error);
        });
    } else {
      updateTask(id, task)
        .then(() => {
          navigate('/'); // Redirect to the Product Backlog Dashboard
        })
        .catch(error => {
          console.error("Error updating task:", error);
        });
    }
  };

  const toggleStage = () => {
    const stages = ['PLANNING', 'DEVELOPMENT', 'TESTING', 'INTEGRATION'];
    const currentIndex = stages.indexOf(task.stage);
    const nextIndex = (currentIndex + 1) % stages.length;
    setTask({ ...task, stage: stages[nextIndex] });
  };

  const toggleStatus = () => {
    const statuses = ['STARTED', 'IN PROGRESS', 'COMPLETED'];
    const currentIndex = statuses.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    setTask({ ...task, status: statuses[nextIndex] });
  };

  const addTag = (tag) => {
    setTask({ ...task, tags: [...task.tags, tag] });
  };

  return (
    <div className="task-details">
      <h2>{isNewTask ? 'New Task' : 'Edit Task'}</h2>
      <form>
        {/* Task Name */}
        <input
          type="text"
          placeholder="Task Name"
          value={task.name}
          onChange={(e) => setTask({ ...task, name: e.target.value })}
        />

        {/* Tags */}
        <div>
          <button type="button" onClick={() => addTag('frontend')}>+ Frontend</button>
          <button type="button" onClick={() => addTag('UI/UX')}>+ UI/UX</button>
          <button type="button" onClick={() => addTag('database')}>+ Database</button>
          <button type="button" onClick={() => addTag('backend')}>+ Backend</button>
          <button type="button" onClick={() => addTag('testing')}>+ Testing</button>
          <button type="button" onClick={() => addTag('API')}>+ API</button>
        </div>

        {/* Task Description */}
        <textarea
          placeholder="Task Description"
          value={task.description}
          onChange={(e) => setTask({ ...task, description: e.target.value })}
        />

        {/* Stage Toggle */}
        <button type="button" onClick={toggleStage}>{task.stage}</button>

        {/* Status Toggle */}
        <button type="button" onClick={toggleStatus}>{task.status}</button>

        {/* Assignee */}
        <input
          type="text"
          placeholder="Assignee"
          value={task.assignee}
          onChange={(e) => setTask({ ...task, assignee: e.target.value })}
        />

        {/* Story Points */}
        <input
          type="range"
          min="1"
          max="10"
          value={task.storyPoints}
          onChange={(e) => setTask({ ...task, storyPoints: parseInt(e.target.value) })}
        />

        {/* Save Button */}
        <button type="button" onClick={handleSave}>Save Task</button>
      </form>
    </div>
  );
}

export default TaskDetails;
