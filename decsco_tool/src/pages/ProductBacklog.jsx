import React, { useState, useEffect, useCallback } from 'react';
import TaskCardView from '../components/TaskCardView';
import TaskCardForm from '../components/TaskCardForm';
import TaskCardDetails from '../components/TaskCardDetails';
import FilterSortControls from '../components/FilterSortControls';
import {compareTokens} from '../helper/helper';
import './ProductBacklog.css';

const ProductBacklog = ({ }) => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filters, setFilters] = useState({ tags: [] });
  const [sortOrder, setSortOrder] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await fetch('http://localhost:3001/product_backlog', {
        method: 'GET'
      });

      if (response.status === 204) {
        setTasks([]);
        setFilteredTasks([]);
        return;
      } else if (!response.ok) {
        throw new Error('Unable to retrieve tasks from database in Product Backlog.');
      }
      const jsonData = await response.json();

      const storedTasks = jsonData.rows;
      
      const tasksWithDates = await Promise.all(storedTasks.map(async (task) => {
        const creationDate = await fetchCreationDate(task.task_id);
        return { ...task, creationDate };
      }));

      setTasks(tasksWithDates);
      setFilteredTasks(tasksWithDates);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const fetchCreationDate = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:3001/tasks/history/creation_date?task_id=${taskId}`, {
        method: 'GET'
      });

      if (response.status === 204) {
        return null;
      }

      if (!response.ok) {
        throw new Error('Unable to fetch creation date');
      }

      const data = await response.json();
      return new Date(data.creation_date);
    } catch (err) {
      console.error('Error fetching creation date:', err);
      return null;
    }
  };

  const addNewTask = async (task) => {
    try {
      if (!JSON.parse(localStorage.getItem('user')).user_token) {
        throw new Error("Invalid user token.");
      }
      const response = await fetch('http://localhost:3001/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });
  
      if (!response.ok) {
        throw new Error(response.message);
      }
      
      let returnData = await response.json();

      // Assign task tags to task in the database
      if (task.task_tags.length !== 0) {
        const tagResponse = await fetch('http://localhost:3001/tasks/tags', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({task_id: returnData.rows[0].task_id,task_tags: task.task_tags}),
        });
    
        if (!tagResponse.ok) {
          throw new Error(tagResponse.message);
        }
      }

      const histEntry = {
        task_id: returnData.rows[0].task_id,
        description: "Task created",
        user_token: JSON.parse(localStorage.getItem('user')).user_token,
        status_id: 1
      }

      const entryResponse = await fetch(`http://localhost:3001/tasks/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(histEntry)
      });
      if (!entryResponse.ok) {
        throw new Error(entryResponse.message);
      }

      const getAddedTaskResponse = await fetch(`http://localhost:3001/tasks?task_id=${returnData.rows[0].task_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      returnData = await getAddedTaskResponse.json();
      const addedTask = returnData.rows[0];
      const creationDate = await fetchCreationDate(addedTask.task_id);
      const updatedTasks = [...tasks, {...addedTask, creationDate}];
      setTasks(updatedTasks);
      setShowNewTaskForm(false);
    } catch (err) {
      console.error('Failed to add new task:', err);
    }
  };

  const openTaskDetails = (task) => {
    setSelectedTask(task);
  };

  const saveTaskDetails = async (updatedTask) => {
    try {
      const oldResponse = await fetch(`http://localhost:3001/tasks?task_id=${updatedTask.task_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!oldResponse.ok) {
        throw new Error(oldResponse.message);
      }

      const oldTagRes = await fetch(`http://localhost:3001/tasks/tags?task_id=${updatedTask.task_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!oldTagRes.ok) {
        throw new Error(oldTagRes.message);
      }

      const response = await fetch(`http://localhost:3001/tasks`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });
      if (!response.ok) {
        throw new Error(response.message);
      }

      const oldData = await oldResponse.json();
      const oldTask = oldData.rows[0];

      let oldTags = [];
      if (oldTagRes.status == 200) {
        const oldTagData = await oldTagRes.json();
        oldTags = oldTagData.rows;
      }

      const findChange = async (obj1, obj2, namingScheme = {}) => {
        const changedAttributes = [];

        for (const key in obj1) {
          if (key === "user_token") {
            const matchedIDs = await compareTokens(obj1["user_token"], obj2["user_id"]);
            if (!matchedIDs) {
              changedAttributes.push(namingScheme[key]);
            }
            continue; 
          }
    
          if (namingScheme[key] && obj1[key] !== obj2[key]) {
            changedAttributes.push(namingScheme[key]);
          }
        }
        return changedAttributes;
      };

      const names = {
        task_name: "name",
        description: "description",
        user_token: "person-in-charge",
        story_point: "story point",
        taskpriority_id: "priority",
        tasktype_id: "type",
        taskstage_id: "stage",
        taskstatus_id: "status"
      }

      const changes = await findChange(updatedTask, oldTask, names);

      let counter = 0;
      for (const tag of oldTags) {
        if (!updatedTask.task_tags.includes(tag.tasktag_id)) {
          counter++;
        }
      }
      if (oldTags.length < updatedTask.task_tags.length) {
        counter += updatedTask.task_tags.length - oldTags.length
      }
      if (counter > 0) {
        changes.push(`${counter} tag${counter > 1 ? 's' : ''}`);
      }

      let entryDesc = ""
      if (changes.length > 0) {
        if (changes.length === 1) {
          entryDesc = `Changed ${changes[0]}`;
        } else {
            const last = changes.pop();
            entryDesc = `Changed ${changes.join(', ')} and ${last}`;
        }

        const histEntry = {
          task_id: updatedTask.task_id,
          description: entryDesc,
          user_token: JSON.parse(localStorage.getItem('user')).user_token,
          status_id: 2
        }
        const entryResponse = await fetch(`http://localhost:3001/tasks/history?task_id=${updatedTask.task_id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(histEntry)
        });
        if (!entryResponse.ok) {
          throw new Error(entryResponse.message);
        }
      }

      const deleteResponse = await fetch(`http://localhost:3001/tasks/tags?task_id=${updatedTask.task_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      if (!deleteResponse.ok) {
        throw new Error(deleteResponse.message);
      }

      if (updatedTask.task_tags.length !== 0) {
        const tagResponse = await fetch('http://localhost:3001/tasks/tags', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({task_id: updatedTask.task_id, task_tags: updatedTask.task_tags}),
        });
    
        if (!tagResponse.ok) {
          throw new Error(tagResponse.message);
        }
      }

      const getAddedTaskResponse = await fetch(`http://localhost:3001/tasks?task_id=${updatedTask.task_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const returnData = await getAddedTaskResponse.json();
      const addedTask = returnData.rows[0];

      let updatedTasks = tasks.filter((t) => t.task_id !== updatedTask.task_id);
      updatedTasks = [...updatedTasks, {...addedTask, creationDate: updatedTask.creationDate}];
      setTasks(updatedTasks);
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:3001/tasks?task_id=${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(response.message);
      }
  
      const updatedTasks = tasks.filter((t) => t.task_id !== taskId);
      setTasks(updatedTasks);
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const closeTaskDetails = () => {
    setSelectedTask(null);
  };

  const applyFiltersAndSort = useCallback(() => {
    let updatedTasks = [...tasks];
    
    if (filters.tags.length > 0) {
      updatedTasks = updatedTasks.filter((task) =>
        filters.tags.every((tag) => task.task_tags.some(taskTag => taskTag.tag_name === tag))
      );
    }

    if (sortOrder) {
      updatedTasks.sort((a, b) => {
        switch (sortOrder) {
          case 'urgent-low':
            return b.taskpriority_id - a.taskpriority_id;
          case 'low-urgent':
            return a.taskpriority_id - b.taskpriority_id;
          case 'latest-oldest':
            return b.creationDate - a.creationDate ? b.creationDate.getTime() - a.creationDate.getTime() : 0;
          case 'oldest-latest':
            return a.creationDate - b.creationDate ? a.creationDate.getTime() - b.creationDate.getTime() : 0;
          // default:
          //   return 0;
        }
      });
    }

    setFilteredTasks(updatedTasks);
  }, [tasks, filters, sortOrder]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  const handleTagFilterChange = (e) => {
    const { value, checked } = e.target;
    setFilters((prevFilters) => {
      const newTags = checked
        ? [...prevFilters.tags, value]
        : prevFilters.tags.filter((tag) => tag !== value);
      return { ...prevFilters, tags: newTags };
    });
  };

  const clearFilters = () => {
    setFilters({ tags: [] });
  };

  const handleSort = (sortType) => {
    setSortOrder(sortType);
  };

  return (
    <div className="product-backlog">
      <header>
        <h1>Product Backlog</h1>
        <button className="new-task" onClick={() => setShowNewTaskForm(true)}>
          + New Task
        </button>
      </header>

      <FilterSortControls
        filters={filters}
        setFilters={setFilters}
        handleTagFilterChange={handleTagFilterChange}
        clearFilters={clearFilters}
        handleSort={handleSort}
      />

      <section className="task-board">
        {filteredTasks.map((task) => (
          <TaskCardView key={task.task_id} task={task} onClick={() => openTaskDetails(task)} />
        ))}
      </section>

      {showNewTaskForm && (
        <TaskCardForm onSubmit={addNewTask} onCancel={() => setShowNewTaskForm(false)} />
      )}

      {selectedTask && (
        <TaskCardDetails
          task={selectedTask}
          onSave={saveTaskDetails}
          onDelete={deleteTask}
          onClose={closeTaskDetails}
        />
      )}
    </div>
  );
};

export default ProductBacklog;