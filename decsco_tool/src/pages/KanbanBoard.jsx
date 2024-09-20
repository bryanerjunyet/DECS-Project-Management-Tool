import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskCardView from '../components/TaskCardView';
import SprintTaskDetails from '../components/SprintTaskDetails';
import './KanbanBoard.css';

const KanbanBoard = () => {
  const { sprintId } = useParams();
  const navigate = useNavigate();
  const [sprint, setSprint] = useState(null);
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    done: []
  });
  const [sprintStatus, setSprintStatus] = useState('Not Started');
  const [timer, setTimer] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);

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

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;

    if (sourceColumn !== destColumn) {
      const sourceItems = Array.from(tasks[sourceColumn]);
      const destItems = Array.from(tasks[destColumn]);
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);

      setTasks({
        ...tasks,
        [sourceColumn]: sourceItems,
        [destColumn]: destItems
      });

      if (destColumn === 'inProgress') {
        startTimer(removed.id);
      } else if (sourceColumn === 'inProgress') {
        stopTimer(removed.id);
      }

      updateTaskStatus(removed.id, getStatusFromColumn(destColumn));
    }
  };

  const getStatusFromColumn = (column) => {
    switch (column) {
      case 'todo': return 'TO DO';
      case 'inProgress': return 'IN PROGRESS';
      case 'done': return 'COMPLETED';
      default: return 'TO DO';
    }
  };

  const startTimer = (taskId) => {
    setTimer(prevTimer => ({
      ...prevTimer,
      [taskId]: { startTime: Date.now(), elapsed: prevTimer[taskId]?.elapsed || 0 }
    }));
  };

  const stopTimer = (taskId) => {
    setTimer(prevTimer => {
      const taskTimer = prevTimer[taskId];
      if (taskTimer) {
        const elapsed = Date.now() - taskTimer.startTime + taskTimer.elapsed;
        updateTaskCompletionTime(taskId, elapsed);
        return { ...prevTimer, [taskId]: null };
      }
      return prevTimer;
    });
  };

  const updateTaskStatus = (taskId, newStatus) => {
    const updatedSprint = { ...sprint };
    const taskIndex = updatedSprint.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      updatedSprint.tasks[taskIndex].taskStatus = newStatus;
      updateSprintInStorage(updatedSprint);
    }
  };

  const updateTaskCompletionTime = (taskId, completionTime) => {
    const updatedSprint = { ...sprint };
    const taskIndex = updatedSprint.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      updatedSprint.tasks[taskIndex].completionTime = completionTime;
      updateSprintInStorage(updatedSprint);
    }
  };

  const updateSprintInStorage = (updatedSprint) => {
    const storedSprints = JSON.parse(localStorage.getItem('sprints')) || [];
    const sprintIndex = storedSprints.findIndex(s => s.id === updatedSprint.id);
    if (sprintIndex !== -1) {
      storedSprints[sprintIndex] = updatedSprint;
      localStorage.setItem('sprints', JSON.stringify(storedSprints));
      setSprint(updatedSprint);
    }
  };

  const handleStartSprint = () => {
    const updatedSprint = { ...sprint, status: 'Active' };
    updateSprintInStorage(updatedSprint);
    setSprintStatus('Active');
  };

  const handleEndSprint = () => {
    const updatedSprint = { ...sprint, status: 'Completed' };
    updateSprintInStorage(updatedSprint);
    setSprintStatus('Completed');
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const handleSaveTask = (editedTask) => {
    const updatedSprint = { ...sprint };
    const taskIndex = updatedSprint.tasks.findIndex(t => t.id === editedTask.id);
    if (taskIndex !== -1) {
      updatedSprint.tasks[taskIndex] = editedTask;
      updateSprintInStorage(updatedSprint);
      setShowTaskDetails(false);
      fetchSprint(); // Refresh the board
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
    <div className="kanban-board">
      <h2>Sprint: {sprint.name}</h2>
      <div className="sprint-controls">
        <p>Status: <span className={`sprint-status ${sprintStatus.toLowerCase()}`}>{sprintStatus}</span></p>
        {sprintStatus === 'Not Started' && (
          <button onClick={handleStartSprint} className="start-sprint">Start Sprint</button>
        )}
        {sprintStatus === 'Active' && (
          <button onClick={handleEndSprint} className="end-sprint">End Sprint</button>
        )}
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-columns">
          {['todo', 'inProgress', 'done'].map((columnId) => (
            <div key={columnId} className="kanban-column">
              <h3>{columnId === 'todo' ? 'To Do' : columnId === 'inProgress' ? 'In Progress' : 'Done'}</h3>
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
                            <TaskCardView task={task} />
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
        <SprintTaskDetails
          task={selectedTask}
          onSave={handleSaveTask}
          onClose={handleCloseTaskDetails}
        />
      )}
    </div>
  );
};

export default KanbanBoard;



// import React, { useState, useEffect } from 'react';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
// import './KanbanBoard.css';

// const KanbanBoard = ({ sprint, onTaskUpdate }) => {
//   const [tasks, setTasks] = useState({
//     todo: [],
//     inProgress: [],
//     done: []
//   });
//   const [sprintStatus, setSprintStatus] = useState(sprint.status);
//   const [timer, setTimer] = useState({});

//   useEffect(() => {
//     // Initialize tasks based on sprint data
//     const initialTasks = {
//       todo: sprint.tasks.filter(task => task.taskStatus === 'TO DO'),
//       inProgress: sprint.tasks.filter(task => task.taskStatus === 'IN PROGRESS'),
//       done: sprint.tasks.filter(task => task.taskStatus === 'COMPLETED')
//     };
//     setTasks(initialTasks);
//   }, [sprint]);

//   const onDragEnd = (result) => {
//     const { source, destination } = result;
//     if (!destination) return;

//     const sourceColumn = source.droppableId;
//     const destColumn = destination.droppableId;

//     if (sourceColumn !== destColumn) {
//       const sourceItems = Array.from(tasks[sourceColumn]);
//       const destItems = Array.from(tasks[destColumn]);
//       const [removed] = sourceItems.splice(source.index, 1);
//       destItems.splice(destination.index, 0, removed);

//       setTasks({
//         ...tasks,
//         [sourceColumn]: sourceItems,
//         [destColumn]: destItems
//       });

//       // Start or stop timer when moving to/from inProgress
//       if (destColumn === 'inProgress') {
//         startTimer(removed.id);
//       } else if (sourceColumn === 'inProgress') {
//         stopTimer(removed.id);
//       }

//       // Update task status
//       const newStatus = destColumn === 'todo' ? 'TO DO' : destColumn === 'inProgress' ? 'IN PROGRESS' : 'COMPLETED';
//       onTaskUpdate({ ...removed, taskStatus: newStatus });
//     }
//   };

//   const startTimer = (taskId) => {
//     setTimer(prevTimer => ({
//       ...prevTimer,
//       [taskId]: { startTime: Date.now(), elapsed: 0 }
//     }));
//   };

//   const stopTimer = (taskId) => {
//     setTimer(prevTimer => {
//       const taskTimer = prevTimer[taskId];
//       if (taskTimer) {
//         const elapsed = Date.now() - taskTimer.startTime + taskTimer.elapsed;
//         onTaskUpdate({ id: taskId, completionTime: elapsed });
//         return { ...prevTimer, [taskId]: null };
//       }
//       return prevTimer;
//     });
//   };

//   const handleStartSprint = () => {
//     setSprintStatus('Active');
//     // Additional logic to start the sprint
//   };

//   const handleEndSprint = () => {
//     setSprintStatus('Completed');
//     // Additional logic to end the sprint
//   };

//   return (
//     <div className="kanban-board">
//       <h2>Sprint {sprint.name}</h2>
//       <div className="sprint-controls">
//         <p>Status: <span className={`sprint-status ${sprintStatus.toLowerCase()}`}>{sprintStatus}</span></p>
//         {sprintStatus === 'Not Started' && (
//           <button onClick={handleStartSprint} className="start-sprint">Start Sprint</button>
//         )}
//         {sprintStatus === 'Active' && (
//           <button onClick={handleEndSprint} className="end-sprint">End Sprint</button>
//         )}
//       </div>
//       <DragDropContext onDragEnd={onDragEnd}>
//         <div className="kanban-columns">
//           {['todo', 'inProgress', 'done'].map((columnId) => (
//             <div key={columnId} className="kanban-column">
//               <h3>{columnId === 'todo' ? 'To Do' : columnId === 'inProgress' ? 'In Progress' : 'Done'}</h3>
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
//                             className="task-card"
//                           >
//                             <h4>{task.name}</h4>
//                             <p>Priority: {task.priority}</p>
//                             <p>Story Points: {task.storyPoint}</p>
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
//     </div>
//   );
// };

// export default KanbanBoard;