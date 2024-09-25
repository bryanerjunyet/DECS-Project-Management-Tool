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
  const timerRef = useRef({});

  useEffect(() => {
    fetchSprint();
  }, [sprintId]);

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

      setTasks(prevTasks => ({
        ...prevTasks,
        [sourceColumn]: sourceTasks,
        [targetColumn]: targetTasks
      }));

      if (targetColumn === 'inProgress' && sourceColumn !== 'inProgress') {
        startTimer(task.id);
      } else if (sourceColumn === 'inProgress' && targetColumn !== 'inProgress') {
        stopTimer(task.id);
      }

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

  const startTimer = (taskId) => {
    if (!timerRef.current[taskId]) {
      timerRef.current[taskId] = {
        startTime: Date.now(),
        elapsed: 0
      };
    }
  };

  const stopTimer = (taskId) => {
    if (timerRef.current[taskId]) {
      const elapsed = Date.now() - timerRef.current[taskId].startTime + timerRef.current[taskId].elapsed;
      updateTaskCompletionTime(taskId, elapsed);
      delete timerRef.current[taskId];
    }
  };

  const updateTaskCompletionTime = (taskId, time) => {
    setTasks(prevTasks => {
      const updatedTasks = {};
      for (const column in prevTasks) {
        updatedTasks[column] = prevTasks[column].map(task =>
          task.id === taskId ? { ...task, completionTime: (task.completionTime || 0) + time } : task
        );
      }
      return updatedTasks;
    });
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

  const handleStartSprint = () => {
    setIsSprintActive(true);
    setSprintStatus('Active');
    const updatedSprint = { ...sprint, status: 'Active' };
    updateSprintInStorage(updatedSprint);
  };

  const handlePauseSprint = () => {
    setIsPaused(true);
    Object.keys(timerRef.current).forEach(taskId => {
      const timer = timerRef.current[taskId];
      timer.elapsed += Date.now() - timer.startTime;
      timer.startTime = null;
    });
  };

  const handleResumeSprint = () => {
    setIsPaused(false);
    Object.keys(timerRef.current).forEach(taskId => {
      timerRef.current[taskId].startTime = Date.now();
    });
  };

  const handleEndSprint = () => {
    setIsSprintActive(false);
    setSprintStatus('Completed');
    Object.keys(timerRef.current).forEach(stopTimer);
    const updatedSprint = { ...sprint, status: 'Completed' };
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
              <button onClick={handleEndSprint} className="end-sprint">End Sprint</button>
            </>
          )}
          {isSprintActive && isPaused && (
            <button onClick={handleResumeSprint} className="resume-sprint">Resume Sprint</button>
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
                  className="task-card"
                  onClick={() => handleTaskClick(task)}
                >
                  <TaskCardView 
                    task={task} 
                    completionTime={timerRef.current[task.id] ? 
                      Date.now() - timerRef.current[task.id].startTime + timerRef.current[task.id].elapsed : 
                      task.completionTime || 0
                    }
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