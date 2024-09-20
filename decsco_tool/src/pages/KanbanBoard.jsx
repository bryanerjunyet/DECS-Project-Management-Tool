import React, { useState, useEffect } from 'react';
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
      <div className="sprint-info">
        <div>Start Date: {sprint.startDate}</div>
        <div>End Date: {sprint.endDate}</div>
        <div className="sprint-status">
          Status: <span className={`status-${sprintStatus.toLowerCase().replace(' ', '-')}`}>{sprintStatus}</span>
        </div>
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