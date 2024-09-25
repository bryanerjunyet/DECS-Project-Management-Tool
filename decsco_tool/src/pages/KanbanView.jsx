import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import TaskCardView from '../components/TaskCardView';
import TaskCardDetails from '../components/TaskCardDetails';
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
  const [isSprintActive, setIsSprintActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sprintTime, setSprintTime] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    fetchSprint();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sprintId]);

  const fetchSprint = () => {
    const storedSprints = JSON.parse(localStorage.getItem('sprints')) || [];
    const foundSprint = storedSprints.find(s => s.id === sprintId);
    if (foundSprint) {
      setSprint(foundSprint);
      setSprintStatus(foundSprint.status || 'Not Started');
      initializeTasks(foundSprint.tasks);
      setSprintTime(foundSprint.totalTime || 0);
      setIsSprintActive(foundSprint.status === 'Active');
      setIsPaused(false);
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

      setTasks(prevTasks => ({
        ...prevTasks,
        [sourceColumn]: sourceTasks,
        [targetColumn]: targetTasks
      }));

      updateTaskStatus(task.id, getStatusFromColumn(targetColumn));
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

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(prevTasks => {
      const updatedTasks = {};
      for (const column in prevTasks) {
        updatedTasks[column] = prevTasks[column].map(task =>
          task.id === taskId ? { ...task, taskStatus: newStatus } : task
        );
      }
      return updatedTasks;
    });
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    startTimeRef.current = Date.now() - sprintTime * 1000;
    timerRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setSprintTime(elapsedSeconds);
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleStartSprint = () => {
    setIsSprintActive(true);
    setSprintStatus('Active');
    startTimer();
    const updatedSprint = { ...sprint, status: 'Active', totalTime: sprintTime };
    updateSprintInStorage(updatedSprint);
  };

  const handlePauseSprint = () => {
    setIsPaused(true);
    pauseTimer();
    const updatedSprint = { ...sprint, totalTime: sprintTime };
    updateSprintInStorage(updatedSprint);
  };

  const handleResumeSprint = () => {
    setIsPaused(false);
    startTimer();
  };

  const handleEndSprint = () => {
    setIsSprintActive(false);
    setSprintStatus('Completed');
    pauseTimer();
    const finalTime = sprintTime;
    setSprintTime(finalTime);
    const updatedSprint = { ...sprint, status: 'Completed', totalTime: finalTime };
    updateSprintInStorage(updatedSprint);
  };

  const updateSprintInStorage = (updatedSprint) => {
    const storedSprints = JSON.parse(localStorage.getItem('sprints')) || [];
    const updatedSprints = storedSprints.map(s =>
      s.id === updatedSprint.id ? updatedSprint : s
    );
    localStorage.setItem('sprints', JSON.stringify(updatedSprints));
    setSprint(updatedSprint);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const handleSaveTask = (editedTask) => {
    setTasks(prevTasks => {
      const updatedTasks = {};
      for (const column in prevTasks) {
        updatedTasks[column] = prevTasks[column].map(task =>
          task.id === editedTask.id ? editedTask : task
        );
      }
      return updatedTasks;
    });
    setShowTaskDetails(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskId) => {
    setTasks(prevTasks => {
      const updatedTasks = {};
      for (const column in prevTasks) {
        updatedTasks[column] = prevTasks[column].filter(task => task.id !== taskId);
      }
      return updatedTasks;
    });
    setShowTaskDetails(false);
    setSelectedTask(null);
  };

  const handleCloseTaskDetails = () => {
    setShowTaskDetails(false);
    setSelectedTask(null);
  };

  const formatTime = (seconds) => {
    if (typeof seconds !== 'number' || isNaN(seconds)) {
      return "00:00:00";
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!sprint) {
    return <div>Loading...</div>;
  }

  return (
    <div className="kanban-view">
      <header className="page-header">
        <h1>Kanban View: {sprint.name}</h1>
        <div className="sprint-controls">
          {!isSprintActive && sprintStatus !== 'Completed' && (
            <button onClick={handleStartSprint} className="start-sprint">Start Sprint</button>
          )}
          {isSprintActive && !isPaused && (
            <>
              <button onClick={handlePauseSprint} className="pause-sprint">Pause Sprint</button>
              <span className="sprint-time">Time: {formatTime(sprintTime)}</span>
              <button onClick={handleEndSprint} className="end-sprint">End Sprint</button>
            </>
          )}
          {isSprintActive && isPaused && (
            <>
              <button onClick={handleResumeSprint} className="resume-sprint">Resume Sprint</button>
              <span className="sprint-time">Time: {formatTime(sprintTime)}</span>
            </>
          )}
        </div>
      </header>
      <div className="sprint-info">
        <div>Start Date: {sprint.startDate}</div>
        <div>End Date: {sprint.endDate}</div>
        <div className={`sprint-status status-${sprintStatus.toLowerCase().replace(' ', '-')}`}>
          Status: {sprintStatus}
        </div>
        <div className={`completed-sprint-time ${sprintStatus === 'Completed' ? 'status-completed' : ''}`}>
          Total Time: {formatTime(sprint.totalTime || 0)}
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
                  className="task-card"
                  onClick={() => handleTaskClick(task)}
                >
                  <TaskCardView 
                    task={task} 
                    completionTime={task.completionTime || 0}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {showTaskDetails && selectedTask && (
        <TaskCardDetails
          task={selectedTask}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onClose={handleCloseTaskDetails}
        />
      )}
    </div>
  );
};

export default KanbanView;