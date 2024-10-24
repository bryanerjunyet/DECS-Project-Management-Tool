import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TaskCardView from '../components/TaskCardView';
import TaskCardDetails from '../components/TaskCardDetails';
import './KanbanView.css';

const KanbanView = () => {
  const { sprintId } = useParams();
  const [sprint, setSprint] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [todoTasks, setTodoTasks] = useState([]);
  const [progressTasks, setProgressTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);

  useEffect(() => {
    fetchAll();
    fetchSprint();
  }, [sprintId]);
  
  const fetchAll = async () => {
    fetchTodoTasks();
    fetchProgressTasks();
    fetchCompletedTasks();
  }

  const fetchSprint = async () => {
    try {
      const response = await fetch(`http://localhost:3001/sprints?sprint_id=${sprintId}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(response.message);
      }
      const jsonData = await response.json();
      setSprint(jsonData.rows[0]);
    } catch (err) {
      console.error('Error fetching sprint:', err);
    }
  }

  const fetchTodoTasks = async () => {
    try {
      const response = await fetch(`http://localhost:3001/sprints/tasks?sprint_id=${sprintId}&taskstatus_id=1`, {
        method: 'GET'
      });

      if (response.status === 204) {
        setTodoTasks([]);
      } else if (!response.ok) {
        throw new Error(response.message);
      } else {
        const jsonData = await response.json();
        setTodoTasks(jsonData.rows);
      }
    } catch (err) {
      console.error('Error fetching todo tasks:', err);
    }
  }

  const fetchProgressTasks = async () => {
    try {
      const response = await fetch(`http://localhost:3001/sprints/tasks?sprint_id=${sprintId}&taskstatus_id=2`, {
        method: 'GET'
      });

      if (response.status === 204) {
        setProgressTasks([]);
      } else if (!response.ok) {
        throw new Error(response.message);
      } else {
        const jsonData = await response.json();
        setProgressTasks(jsonData.rows);
      }
    } catch (err) {
      console.error('Error fetching in-progress tasks:', err);
    }
  }

  const fetchCompletedTasks = async () => {
    try {
      const response = await fetch(`http://localhost:3001/sprints/tasks?sprint_id=${sprintId}&taskstatus_id=3`, {
        method: 'GET'
      });

      if (response.status === 204) {
        setCompletedTasks([]);
      } else if (!response.ok) {
        throw new Error(response.message);
      } else {
        const jsonData = await response.json();
        setCompletedTasks(jsonData.rows);
      }
    } catch (err) {
      console.error('Error fetching completed tasks:', err);
    }
  }

  const handleDragStart = (e, task) => {
    if (sprint.sprintstatus_id === 3) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('application/json', JSON.stringify(task));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    if (sprint.sprintstatus_id === 3) {
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('dragged-over');
  };

  const handleDragLeave = (e) => {
    if (sprint.sprintstatus_id === 3) {
      return;
    }
    e.currentTarget.classList.remove('dragged-over');
  };

  const handleDrop = async (e, newStatus) => {
    if (sprint.sprintstatus_id === 3) {
      return;
    }
    e.preventDefault();
    const droppedTask = JSON.parse(e.dataTransfer.getData('application/json'));
    
    if (droppedTask.taskstatus_id !== newStatus) {
      try {
        const response = await fetch(`http://localhost:3001/tasks`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          }, 
          body: JSON.stringify({
            task_id: droppedTask.task_id,
            taskstatus_id: newStatus
          }),
        });
        if (!response.ok) {
          throw new Error(response.message);
        }
        fetchAll();
      } catch (err) {
        console.error('Failed to update task status:', err);
      }
    }
  };

  const handleStartSprint = async () => {
    if (sprint.sprintstatus_id !== 1) return;
    try {
      const response = await fetch(`http://localhost:3001/sprints`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }, 
        body: JSON.stringify({
          sprint_id: sprint.sprint_id,
          sprintstatus_id: 2
        }),
      });
      if (!response.ok) {
        throw new Error(response.message);
      }
      fetchSprint();
    } catch (err) {
      console.error('Failed to activate sprint:', err);
    }
  };

  const handleEndSprint = async () => {
    if (sprint.sprintstatus_id !== 2) return;
    try {
      const response = await fetch(`http://localhost:3001/sprints`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }, 
        body: JSON.stringify({
          sprint_id: sprint.sprint_id,
          sprintstatus_id: 3
        }),
      });
      if (!response.ok) {
        throw new Error(response.message);
      }
      fetchSprint();
    } catch (err) {
      console.error('Failed to end sprint:', err);
    }
  };

  const handleTaskClick = (task) => {
    if (sprint.sprintstatus_id === 3) return;
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const handleSaveTask = async (editedTask) => {
    if (sprint.sprintstatus_id === 3) return;
    try {
      const response = await fetch(`http://localhost:3001/tasks`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedTask),
      });
      if (!response.ok) {
        throw new Error(response.message);
      }
      fetchAll();
      setShowTaskDetails(false);
      setSelectedTask(null);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleCloseTaskDetails = () => {
    setShowTaskDetails(false);
    setSelectedTask(null);
  };

  if (!sprint) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`kanban-view ${sprint.sprintstatus_id === 3 ? 'completed-sprint' : ''}`}>
      <header className="page-header">
        <h1>Kanban View: {sprint.sprint_name}</h1>
        <div className="sprint-controls">
          {sprint.sprintstatus_id === 1 && (
            <button onClick={handleStartSprint} className="start-sprint">Start Sprint</button>
          )}
          {sprint.sprintstatus_id === 2 && (
            <button onClick={handleEndSprint} className="end-sprint">End Sprint</button>
          )}
        </div>
      </header>
      <div className="sprint-info">
        <div>Start Date: {sprint.display_start_date}</div>
        <div>End Date: {sprint.display_end_date}</div>
        <div className={`sprint-status status-${sprint.status_name.toLowerCase().replace(' ', '-')}`}>
          Status: {sprint.status_name}
        </div>
      </div>
      <div className="kanban-container">
        <div className="kanban-column" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, 1)}>
          <h3 className="kanban-column-title todo">To-Do</h3>
          <div className="task-list">
            {todoTasks.map((task) => (
              <div
                key={task.task_id}
                draggable={sprint.sprintstatus_id !== 3}
                onDragStart={(e) => handleDragStart(e, task)}
                onClick={() => handleTaskClick(task)}
              >
                <TaskCardView task={task} />
              </div>
            ))}
          </div>
        </div>

        <div className="kanban-column" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, 2)}>
          <h3 className="kanban-column-title inProgress">In-Progress</h3>
          <div className="task-list">
            {progressTasks.map((task) => (
              <div
                key={task.task_id}
                draggable={sprint.sprintstatus_id !== 3}
                onDragStart={(e) => handleDragStart(e, task)}
                onClick={() => handleTaskClick(task)}
              >
                <TaskCardView task={task} />
              </div>
            ))}
          </div>
        </div>

        <div className="kanban-column" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, 3)}>
          <h3 className="kanban-column-title done">Done</h3>
          <div className="task-list">
            {completedTasks.map((task) => (
              <div
                key={task.task_id}
                draggable={sprint.sprintstatus_id !== 3}
                onDragStart={(e) => handleDragStart(e, task)}
                onClick={() => handleTaskClick(task)}
              >
                <TaskCardView task={task} />
              </div>
            ))}
          </div>
        </div>
      </div>
      {showTaskDetails && selectedTask && (
        <TaskCardDetails
          task={selectedTask}
          onSave={handleSaveTask}
          onClose={handleCloseTaskDetails}
          readOnly={sprint.sprintstatus_id === 3}
        />
      )}
    </div>
  );
};

export default KanbanView;