import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskCardView from '../components/TaskCardView';
import SprintTaskDetails from '../components/SprintTaskDetails';
import './KanbanBoard.css';

const KanbanBoard = () => {
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
      todo: sprintTasks,
      inProgress: [],
      done: []
    };
    setTasks(initialTasks);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;

    const sourceItems = Array.from(tasks[sourceColumn]);
    const destItems = Array.from(tasks[destColumn]);
    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);

    setTasks({
      ...tasks,
      [sourceColumn]: sourceItems,
      [destColumn]: destItems
    });

    if (destColumn === 'inProgress' && sourceColumn !== 'inProgress') {
      startTimer(removed.id);
    } else if (sourceColumn === 'inProgress' && destColumn !== 'inProgress') {
      stopTimer(removed.id);
    }

    updateTaskStatus(removed.id, getStatusFromColumn(destColumn));
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
    const updatedTasks = Object.keys(tasks).reduce((acc, column) => {
      acc[column] = tasks[column].map(task => 
        task.id === taskId ? { ...task, completionTime: (task.completionTime || 0) + time } : task
      );
      return acc;
    }, {});
    setTasks(updatedTasks);
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
    const updatedTasks = Object.keys(tasks).reduce((acc, column) => {
      acc[column] = tasks[column].map(task => 
        task.id === taskId ? { ...task, taskStatus: newStatus } : task
      );
      return acc;
    }, {});
    setTasks(updatedTasks);
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
    const updatedTasks = Object.keys(tasks).reduce((acc, column) => {
      acc[column] = tasks[column].map(task => 
        task.id === editedTask.id ? editedTask : task
      );
      return acc;
    }, {});
    setTasks(updatedTasks);
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
    <div className="kanban-board">
      <header className="page-header">
        <h1>Kanban Board: {sprint.name}</h1>
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
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-columns">
          {['todo', 'inProgress', 'done'].map((columnId) => (
            <div key={columnId} className="kanban-column">
              <h3 className="kanban-column-title">{columnId === 'todo' ? 'To-Do' : columnId === 'inProgress' ? 'In-Progress' : 'Done'}</h3>
              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="task-list"
                  >
                    {tasks[columnId].map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
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
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
      {showTaskDetails && selectedTask && (
        <div className="task-details-overlay">
          <div className="task-details-container">
            <SprintTaskDetails
              task={selectedTask}
              onSave={handleSaveTask}
              onClose={handleCloseTaskDetails}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;


// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
// import TaskCardView from '../components/TaskCardView';
// import SprintTaskDetails from '../components/SprintTaskDetails';
// import './KanbanBoard.css';

// const KanbanBoard = () => {
//   const { sprintId } = useParams();
//   const [sprint, setSprint] = useState(null);
//   const [tasks, setTasks] = useState({
//     todo: [],
//     inProgress: [],
//     done: []
//   });
//   const [sprintStatus, setSprintStatus] = useState('Not Started');
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [showTaskDetails, setShowTaskDetails] = useState(false);
//   const [isSprintActive, setIsSprintActive] = useState(false);
//   const [sprintTimer, setSprintTimer] = useState(null);

//   useEffect(() => {
//     fetchSprint();
//   }, [sprintId]);

//   const fetchSprint = () => {
//     const storedSprints = JSON.parse(localStorage.getItem('sprints')) || [];
//     const foundSprint = storedSprints.find(s => s.id === sprintId);
//     if (foundSprint) {
//       setSprint(foundSprint);
//       setSprintStatus(foundSprint.status || 'Not Started');
//       initializeTasks(foundSprint.tasks);
//     }
//   };

//   const initializeTasks = (sprintTasks) => {
//     const initialTasks = {
//       todo: sprintTasks,
//       inProgress: [],
//       done: []
//     };
//     setTasks(initialTasks);
//   };

//   const onDragEnd = (result) => {
//     const { source, destination } = result;
//     if (!destination) return;

//     const sourceColumn = source.droppableId;
//     const destColumn = destination.droppableId;

//     const sourceItems = Array.from(tasks[sourceColumn]);
//     const destItems = Array.from(tasks[destColumn]);
//     const [removed] = sourceItems.splice(source.index, 1);
//     destItems.splice(destination.index, 0, removed);

//     setTasks({
//       ...tasks,
//       [sourceColumn]: sourceItems,
//       [destColumn]: destItems
//     });

//     if (destColumn === 'inProgress' && sourceColumn !== 'inProgress') {
//       startTimer(removed.id);
//     } else if (sourceColumn === 'inProgress' && destColumn !== 'inProgress') {
//       stopTimer(removed.id);
//     }

//     updateTaskStatus(removed.id, getStatusFromColumn(destColumn));
//   };

//   const startTimer = (taskId) => {
//     const updatedTasks = tasks.inProgress.map(task => {
//       if (task.id === taskId) {
//         return { ...task, startTime: Date.now() };
//       }
//       return task;
//     });
//     setTasks(prevTasks => ({ ...prevTasks, inProgress: updatedTasks }));
//   };

//   const stopTimer = (taskId) => {
//     const task = tasks.inProgress.find(t => t.id === taskId);
//     if (task && task.startTime) {
//       const elapsedTime = Date.now() - task.startTime;
//       updateTaskCompletionTime(taskId, elapsedTime);
//     }
//   };

//   const updateTaskCompletionTime = (taskId, elapsedTime) => {
//     const updatedTasks = Object.keys(tasks).reduce((acc, column) => {
//       acc[column] = tasks[column].map(task => {
//         if (task.id === taskId) {
//           return { ...task, completionTime: (task.completionTime || 0) + elapsedTime };
//         }
//         return task;
//       });
//       return acc;
//     }, {});
//     setTasks(updatedTasks);
//   };

//   const handleStartSprint = () => {
//     setIsSprintActive(true);
//     setSprintStatus('Active');
//     const updatedSprint = { ...sprint, status: 'Active' };
//     updateSprintInStorage(updatedSprint);
//     setSprintTimer(setInterval(() => {
//       setSprint(prevSprint => ({ ...prevSprint, elapsedTime: (prevSprint.elapsedTime || 0) + 1000 }));
//     }, 1000));
//   };

//   const handlePauseSprint = () => {
//     clearInterval(sprintTimer);
//     setIsSprintActive(false);
//     const updatedSprint = { ...sprint, status: 'Paused' };
//     updateSprintInStorage(updatedSprint);
//     setSprintStatus('Paused');
//   };

//   const handleEndSprint = () => {
//     clearInterval(sprintTimer);
//     setIsSprintActive(false);
//     const updatedSprint = { ...sprint, status: 'Completed' };
//     updateSprintInStorage(updatedSprint);
//     setSprintStatus('Completed');
//   };

//   const handleTaskClick = (task) => {
//     setSelectedTask(task);
//     setShowTaskDetails(true);
//   };

//   const handleSaveTask = (editedTask) => {
//     const updatedSprint = { ...sprint };
//     const taskIndex = updatedSprint.tasks.findIndex(t => t.id === editedTask.id);
//     if (taskIndex !== -1) {
//       updatedSprint.tasks[taskIndex] = editedTask;
//       updateSprintInStorage(updatedSprint);
//       setShowTaskDetails(false);
//       fetchSprint();
//     }
//   };

//   const handleCloseTaskDetails = () => {
//     setShowTaskDetails(false);
//     setSelectedTask(null);
//   };

//   const updateSprintInStorage = (updatedSprint) => {
//     const storedSprints = JSON.parse(localStorage.getItem('sprints')) || [];
//     const updatedSprints = storedSprints.map(s => 
//       s.id === updatedSprint.id ? updatedSprint : s
//     );
//     localStorage.setItem('sprints', JSON.stringify(updatedSprints));
//     setSprint(updatedSprint);
//   };

//   const getStatusFromColumn = (column) => {
//     switch (column) {
//       case 'todo': return 'To Do';
//       case 'inProgress': return 'In Progress';
//       case 'done': return 'Completed';
//       default: return 'To Do';
//     }
//   };

//   const updateTaskStatus = (taskId, newStatus) => {
//     const updatedSprint = { ...sprint };
//     const taskIndex = updatedSprint.tasks.findIndex(t => t.id === taskId);
//     if (taskIndex !== -1) {
//       updatedSprint.tasks[taskIndex].status = newStatus;
//       updateSprintInStorage(updatedSprint);
//     }
//   };

//   if (!sprint) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="kanban-board">
//       <h2>Sprint: {sprint.name}</h2>
//       <div className="sprint-info">
//         <div>Start Date: {sprint.startDate}</div>
//         <div>End Date: {sprint.endDate}</div>
//         <div className="sprint-status">
//           Status: <span className={`status-${sprintStatus.toLowerCase().replace(' ', '-')}`}>{sprintStatus}</span>
//         </div>
//         {sprintStatus === 'Not Started' && (
//           <button onClick={handleStartSprint} className="start-sprint">Start Sprint</button>
//         )}
//         {sprintStatus === 'Active' && (
//           <>
//             <button onClick={handlePauseSprint} className="pause-sprint">Pause Sprint</button>
//             <button onClick={handleEndSprint} className="end-sprint">End Sprint</button>
//           </>
//         )}
//         {sprintStatus === 'Paused' && (
//           <button onClick={handleStartSprint} className="start-sprint">Resume Sprint</button>
//         )}
//       </div>
//       <DragDropContext onDragEnd={onDragEnd}>
//         <div className="kanban-columns">
//           {['todo', 'inProgress', 'done'].map((columnId) => (
//             <div key={columnId} className="kanban-column">
//               <h3 className="kanban-column-title">{columnId === 'todo' ? 'To-Do' : columnId === 'inProgress' ? 'In-Progress' : 'Done'}</h3>
//               <Droppable droppableId={columnId}>
//                 {(provided) => (
//                   <div
//                     {...provided.droppableProps}
//                     ref={provided.innerRef}
//                     className="task-list"
//                   >
//                     {tasks[columnId].map((task, index) => (
//                       <Draggable key={task.id} draggableId={task.id} index={index}>
//                         {(provided) => (
//                           <div
//                             ref={provided.innerRef}
//                             {...provided.draggableProps}
//                             {...provided.dragHandleProps}
//                             onClick={() => handleTaskClick(task)}
//                           >
//                             <TaskCardView task={task} />
//                           </div>
//                         )}
//                       </Draggable>
//                     ))}
//                     {provided.placeholder}
//                   </div>
//                 )}
//               </Droppable>
//             </div>
//           ))}
//         </div>
//       </DragDropContext>
//       {showTaskDetails && selectedTask && (
//         <div className="task-details-overlay">
//           <div className="task-details-container">
//             <SprintTaskDetails
//               task={selectedTask}
//               onSave={handleSaveTask}
//               onClose={handleCloseTaskDetails}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default KanbanBoard;