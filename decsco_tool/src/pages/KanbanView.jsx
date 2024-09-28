import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TaskCardView from '../components/TaskCardView';
import SprintTaskDetails from '../components/SprintTaskDetails';
import './KanbanView.css';

const KanbanView = () => {
  const { sprintId } = useParams();
  const [sprint, setSprint] = useState(null);
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    done: []
  });
  const [sprintStatus, setSprintStatus] = useState('Not Started');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchSprint();
    fetchCurrentUser();
  }, [sprintId]);

  const fetchCurrentUser = () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setCurrentUser(storedUser);
    }
  };

  const fetchSprint = () => {
    const storedSprints = JSON.parse(localStorage.getItem('sprints')) || [];
    const foundSprint = storedSprints.find(s => s.id === sprintId);
    if (foundSprint) {
      setSprint(foundSprint);
      setSprintStatus(foundSprint.status || 'Not Started');
      initializeTasks(foundSprint.tasks);
    }
  };

  const initializeTasks = (sprintTasks) => {
    const initialTasks = {
      todo: sprintTasks.filter(task => task.taskStatus === 'TO DO'),
      inProgress: sprintTasks.filter(task => task.taskStatus === 'IN PROGRESS'),
      done: sprintTasks.filter(task => task.taskStatus === 'COMPLETED')
    };
    setTasks(initialTasks);
  };

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('application/json', JSON.stringify(task));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('dragged-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('dragged-over');
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragged-over');
    const taskData = e.dataTransfer.getData('application/json');
    const task = JSON.parse(taskData);
    const sourceColumn = findTaskColumn(task.id);

    if (sourceColumn !== targetColumn) {
      const sourceTasks = tasks[sourceColumn].filter(t => t.id !== task.id);
      const targetTasks = [...tasks[targetColumn], { ...task, taskStatus: getStatusFromColumn(targetColumn) }];

      const updatedTasks = {
        ...tasks,
        [sourceColumn]: sourceTasks,
        [targetColumn]: targetTasks
      };

      setTasks(updatedTasks);
      updateTaskStatus(task.id, getStatusFromColumn(targetColumn), updatedTasks);
    }
  };

  const findTaskColumn = (taskId) => {
    for (const column in tasks) {
      if (tasks[column].some(task => task.id === taskId)) {
        return column;
      }
    }
    return null;
  };

  const getStatusFromColumn = (column) => {
    switch (column) {
      case 'todo': return 'TO DO';
      case 'inProgress': return 'IN PROGRESS';
      case 'done': return 'COMPLETED';
      default: return 'TO DO';
    }
  };

  const updateTaskStatus = (taskId, newStatus, updatedTasks) => {
    const storedSprints = JSON.parse(localStorage.getItem('sprints')) || [];
    const updatedSprints = storedSprints.map(s => {
      if (s.id === sprintId) {
        return {
          ...s,
          tasks: Object.values(updatedTasks).flat()
        };
      }
      return s;
    });
    localStorage.setItem('sprints', JSON.stringify(updatedSprints));
  };

  const handleStartSprint = () => {
    setSprintStatus('Active');
    updateSprintStatus('Active');
  };

  const handleEndSprint = () => {
    setSprintStatus('Completed');
    updateSprintStatus('Completed');
  };

  const updateSprintStatus = (status) => {
    const storedSprints = JSON.parse(localStorage.getItem('sprints')) || [];
    const updatedSprints = storedSprints.map(s =>
      s.id === sprintId ? { ...s, status: status } : s
    );
    localStorage.setItem('sprints', JSON.stringify(updatedSprints));
    setSprint({ ...sprint, status: status });
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const handleSaveTask = (editedTask) => {
    const updatedTasks = Object.keys(tasks).reduce((acc, column) => {
      acc[column] = tasks[column].map(task =>
        task.id === editedTask.id ? editedTask : task
      );
      return acc;
    }, {});

    setTasks(updatedTasks);
    updateTaskInStorage(editedTask);
    setShowTaskDetails(false);
    setSelectedTask(null);
  };

  const updateTaskInStorage = (updatedTask) => {
    const storedSprints = JSON.parse(localStorage.getItem('sprints')) || [];
    const updatedSprints = storedSprints.map(s => {
      if (s.id === sprintId) {
        return {
          ...s,
          tasks: s.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
        };
      }
      return s;
    });
    localStorage.setItem('sprints', JSON.stringify(updatedSprints));
  };

  const handleCloseTaskDetails = () => {
    setShowTaskDetails(false);
    setSelectedTask(null);
  };

  if (!sprint) {
    return <div>Loading...</div>;
  }

  return (
    <div className="kanban-view">
      <header className="page-header">
        <h1>Kanban View: {sprint.name}</h1>
        <div className="sprint-controls">
          {sprintStatus === 'Not started' && (
            <button onClick={handleStartSprint} className="start-sprint">Start Sprint</button>
          )}
          {sprintStatus === 'Active' && (
            <button onClick={handleEndSprint} className="end-sprint">End Sprint</button>
          )}
        </div>
      </header>
      <div className="sprint-info">
        <div>Start Date: {sprint.startDate}</div>
        <div>End Date: {sprint.endDate}</div>
        <div className={`sprint-status status-${sprintStatus.toLowerCase().replace(' ', '-')}`}>
          Status: {sprintStatus}
        </div>
      </div>
      <div className="kanban-columns">
        {['todo', 'inProgress', 'done'].map((columnId) => (
          <div
            key={columnId}
            className="kanban-column"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, columnId)}
          >
            <h3 className={`kanban-column-title ${columnId}`}>
              {columnId === 'todo' ? 'To-Do' : columnId === 'inProgress' ? 'In-Progress' : 'Done'}
            </h3>
            <div className="task-list">
              {tasks[columnId].map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onClick={() => handleTaskClick(task)}
                >
                  <TaskCardView task={task} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {showTaskDetails && selectedTask && currentUser && (
        <SprintTaskDetails
          task={selectedTask}
          onSave={handleSaveTask}
          onClose={handleCloseTaskDetails}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default KanbanView;