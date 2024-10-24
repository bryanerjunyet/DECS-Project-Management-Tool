import React, { useState, useEffect } from 'react';
import TaskCardView from './TaskCardView';
import TaskCardDetails from './TaskCardDetails';
import './DeleteModal.css';

const DeleteModal = ({ staff, onConfirm, onCancel }) => {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);

  useEffect(() => {
    loadAssignedTasks();
  }, [staff]);

  const loadAssignedTasks = () => {
    const storedSprints = JSON.parse(localStorage.getItem('sprints')) || [];
    const productTasks = JSON.parse(localStorage.getItem('tasks')) || [];

    let tasks = [];

    // Check sprint tasks
    storedSprints.forEach(sprint => {
      const sprintTasks = sprint.tasks || [];
      tasks = tasks.concat(sprintTasks.filter(task => task.personInCharge === staff.username)
        .map(task => ({ ...task, sprintId: sprint.id })));
    });

    // Check product backlog tasks
    tasks = tasks.concat(productTasks.filter(task => task.personInCharge === staff.username));

    setAssignedTasks(tasks);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  const handleTaskSave = (updatedTask) => {
    // Update the task in the state
    setAssignedTasks(prevTasks => 
      prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task)
    );

    // Update the task in the appropriate storage
    if (updatedTask.sprintId) {
      // Update sprint task
      const storedSprints = JSON.parse(localStorage.getItem('sprints')) || [];
      const updatedSprints = storedSprints.map(sprint => {
        if (sprint.id === updatedTask.sprintId) {
          const updatedTasks = sprint.tasks.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          );
          return { ...sprint, tasks: updatedTasks };
        }
        return sprint;
      });
      localStorage.setItem('sprints', JSON.stringify(updatedSprints));
    } else {
      // Update product backlog task
      const productTasks = JSON.parse(localStorage.getItem('tasks')) || [];
      const updatedProductTasks = productTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
      localStorage.setItem('tasks', JSON.stringify(updatedProductTasks));
    }

    setIsTaskDetailsOpen(false);
  };

  const handleConfirmDelete = () => {
    const remainingTasks = assignedTasks.filter(task => task.personInCharge === staff.username);
    if (remainingTasks.length === 0) {
      onConfirm();
    } else {
      alert("Please reassign all tasks before deleting the staff member.");
    }
  };

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal">
        <h2>Delete Staff Member</h2>
        <p>Are you sure you want to remove {staff.username} from the company?</p>
        
        {assignedTasks.length > 0 && (
          <div className="assigned-tasks">
            <h3>Reassigned Tasks</h3>
            <p>Please reassign the following tasks before deleting this staff member:</p>
            <div className="task-list">
              {assignedTasks.map(task => (
                <TaskCardView 
                  key={task.id} 
                  task={task} 
                  onClick={() => handleTaskClick(task)}
                  highlight={task.personInCharge === staff.username}
                />
              ))}
            </div>
          </div>
        )}

        <div className="button-group">
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="confirm-btn" onClick={handleConfirmDelete}>Confirm</button>
        </div>

        {isTaskDetailsOpen && (
          <TaskCardDetails
            task={selectedTask}
            onSave={handleTaskSave}
            onClose={() => setIsTaskDetailsOpen(false)}
            readOnly={false}
            currentUser={staff.username}
          />
        )}
      </div>
    </div>
  );
};

export default DeleteModal;