const express = require("express");
const cors = require("cors");
const db_pool = require("./database"); 
const userRoutes = require('./user');
const historyRoutes = require('./history');
const sprintRoutes = require('./sprint');
const teamBoardRoutes = require('./teamboard');

const { query, body, validationResult } = require('express-validator');
const { insertQuery, searchQuery, deleteQuery, updateQuery } = require("./query-builders");
const {generateUserToken, decodeUserToken} = require('./auth');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

/* RAW
Get all tasks or tasks based on provided URL search queries (for now it can only search for exact values)
- Data will be raw (Retrieved as is)
- Leave the queries empty to get all tasks
- Fields that do not exist in the table will be ignored

--- Example usage for search parameters ---
Query sent in fetch request:
  .../tasks?task_id=5&task_name=Search%20Query
- This will search for a task with task_id 5 and a task_name of "Search Query"
*/
// Refactor later !!!
// app.get('/tasks/raw',
//   // Data validation
//   query('task_id').optional().isInt().withMessage('Task ID must be an integer'),
//   query('task_name').optional().isString().withMessage('Task Name must be a string'),
//   query('description').optional().isString().withMessage('Description must be a string'),
//   query('user_id').optional().isInt().withMessage('User ID must be an integer'),
//   query('story_point').optional().isInt().withMessage('Story Point must be an integer'),
//   query('taskpriority_id').optional().isInt().withMessage('Task Priority ID must be an integer'),
//   query('tasktype_id').optional().isInt().withMessage('Task Type ID must be an integer'),
//   query('taskstage_id').optional().isInt().withMessage('Task Stage ID must be an integer'),
//   query('taskstatus_id').optional().isInt().withMessage('Task Status ID must be an integer'),
//   async(req, res) => {
//     // Responds with validation error messages
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     // Attempts to send SQL query to database
//     try {
//       const { 
//         task_id = undefined,
//         task_name = undefined,
//         description = undefined,
//         user_id = undefined,
//         story_point = undefined,
//         taskpriority_id = undefined,
//         tasktype_id = undefined,
//         taskstage_id = undefined,
//         taskstatus_id = undefined
//       } = req.query;

//       const tasks = { 
//         task_id: task_id == undefined ? undefined : parseInt(task_id, 10),
//         task_name,
//         description,
//         user_id: user_id == undefined ? undefined : parseInt(user_id, 10),
//         story_point: story_point == undefined ? undefined : parseInt(story_point, 10),
//         taskpriority_id: taskpriority_id == undefined ? undefined : parseInt(taskpriority_id, 10),
//         tasktype_id: tasktype_id == undefined ? undefined : parseInt(tasktype_id, 10),
//         taskstage_id: taskstage_id == undefined ? undefined : parseInt(taskstage_id, 10),
//         taskstatus_id: taskstatus_id == undefined ? undefined : parseInt(taskstatus_id, 10)
//       };

//       // Builds query and sends to database
//       const { query, values } = searchQuery("Task", tasks);
//       const response = await db_pool.query(query, values);

//       if (response.rows.length === 0) {
//         res.status(204).json(response);
//       } else {
//         res.status(200).json(response);
//       }
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).json(err.message);        
//     };
//   }
// );

/* FULL DISPLAY
Get all tasks or tasks based on provided URL search queries (for now it can only search for exact values)
- Can only search for fields that are in Task table
- Data will have appropriate display names alongside raw data
- Leave the queries empty to get all tasks
- Fields that do not exist in the table will be ignored
- User IDs are tokenized

--- Example usage for search parameters ---
Query sent in fetch request:
  .../tasks?task_id=5&task_name=Search%20Query
- This will search for a task with task_id 5 and a task_name of "Search Query"
*/
app.get('/tasks',
  // Data validation
  query('task_id').optional().isInt().withMessage('Task ID must be an integer'),
  query('task_name').optional().isString().withMessage('Task Name must be a string'),
  query('description').optional().isString().withMessage('Description must be a string'),
  query('user_token').optional().isString().withMessage('User ID must be a string'),
  query('story_point').optional().isInt().withMessage('Story Point must be an integer'),
  query('taskpriority_id').optional().isInt().withMessage('Task Priority ID must be an integer'),
  query('tasktype_id').optional().isInt().withMessage('Task Type ID must be an integer'),
  query('taskstage_id').optional().isInt().withMessage('Task Stage ID must be an integer'),
  query('taskstatus_id').optional().isInt().withMessage('Task Status ID must be an integer'),
  async(req, res) => {
    // Responds with validation error messages
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Attempts to send SQL query to database
    try {
      const { 
        task_id = undefined,
        task_name = undefined,
        description = undefined,
        user_token = undefined,
        story_point = undefined,
        taskpriority_id = undefined,
        tasktype_id = undefined,
        taskstage_id = undefined,
        taskstatus_id = undefined
      } = req.query;

      const user_id = user_token == undefined ? undefined : decodeUserToken(user_token)?.user_id;
      if (!user_id && user_token != undefined) {
        return res.status(400).json({ message: "User token is invalid." });
      }

      const tasks = { 
        task_id: task_id == undefined ? undefined : parseInt(task_id, 10),
        task_name,
        description,
        user_id: user_id,
        story_point: story_point == undefined ? undefined : parseInt(story_point, 10),
        taskpriority_id: taskpriority_id == undefined ? undefined : parseInt(taskpriority_id, 10),
        tasktype_id: tasktype_id == undefined ? undefined : parseInt(tasktype_id, 10),
        taskstage_id: taskstage_id == undefined ? undefined : parseInt(taskstage_id, 10),
        taskstatus_id: taskstatus_id == undefined ? undefined : parseInt(taskstatus_id, 10)
      };
      //!!! Temporary way to create query that can retrieve display names. Replace with more robust approach later !!!
      // Removes undefined fields
      const fields = Object.keys(tasks).filter(key => tasks[key] !== undefined);
      // Adds the values to an array for the Pool query request
      const values = fields.map(key => tasks[key]);
      // Builds the WHERE clause
      const whereClause = fields.length === 0 ? "" : " WHERE " + fields.map((field, index) => {
        return values[index] === null 
            ? `t.${field} IS NULL` 
            : `t.${field} = $${index + 1}`;
        }).join(' AND ');
      // Builds query and sends to database
      const response = await db_pool.query(
        `SELECT t.task_id,
        t.task_name,
        t.description,
        t.user_id,
        m.user_name AS user_name,
        t.story_point,
        t.taskpriority_id,
        tp.priority_name AS priority_name,
        t.tasktype_id,
        tt.type_name AS type_name,
        t.taskstage_id,
        ts.stage_name AS stage_name,
        t.taskstatus_id,
        ts2.status_name AS status_name
        FROM Task t
        LEFT JOIN SysUser m ON t.user_id = m.user_id
        LEFT JOIN TaskPriority tp ON t.taskpriority_id = tp.taskpriority_id
        LEFT JOIN TaskType tt ON t.tasktype_id = tt.tasktype_id
        LEFT JOIN TaskStage ts ON t.taskstage_id = ts.taskstage_id
        LEFT JOIN TaskStatus ts2 ON t.taskstatus_id = ts2.taskstatus_id 
        ${whereClause}`,
        values
      );

      for (let i = 0; i < response.rows.length; i++) {
        // Retrieve task tags
        const tagResponse = await db_pool.query(
          `SELECT t.tasktag_id, t.tag_name
            FROM JT_TaskTags j
              JOIN TaskTag t ON j.tasktag_id = t.tasktag_id
                WHERE j.task_id = $1;`,
          [response.rows[i].task_id]
        );
        
        response.rows[i].task_tags = tagResponse.rows

        // Tokenize user IDs
        response.rows[i].user_id = generateUserToken(response.rows[i].user_id);
      }

      if (response.rows.length === 0) {
        res.status(204).json();
      } else {
        res.status(200).json(response);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json(err.message);        
    };
  }
);

/*
Gets all full task details of all tasks that are not assigned to a sprint
*/
app.get('/product_backlog',
  // Data validation
  query('task_id').optional().isInt().withMessage('Task ID must be an integer'),
  query('task_name').optional().isString().withMessage('Task Name must be a string'),
  query('description').optional().isString().withMessage('Description must be a string'),
  query('user_token').optional().isString().withMessage('User ID must be a string'),
  query('story_point').optional().isInt().withMessage('Story Point must be an integer'),
  query('taskpriority_id').optional().isInt().withMessage('Task Priority ID must be an integer'),
  query('tasktype_id').optional().isInt().withMessage('Task Type ID must be an integer'),
  query('taskstage_id').optional().isInt().withMessage('Task Stage ID must be an integer'),
  query('taskstatus_id').optional().isInt().withMessage('Task Status ID must be an integer'),
  async(req, res) => {
    // Responds with validation error messages
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Attempts to send SQL query to database
    try {
      const { 
        task_id = undefined,
        task_name = undefined,
        description = undefined,
        user_token = undefined,
        story_point = undefined,
        taskpriority_id = undefined,
        tasktype_id = undefined,
        taskstage_id = undefined,
        taskstatus_id = undefined
      } = req.query;

      const user_id = user_token == undefined ? undefined : decodeUserToken(user_token)?.user_id;
      if (!user_id && user_token != undefined) {
        return res.status(400).json({ message: "User token is invalid." });
      }

      const tasks = { 
        task_id: task_id == undefined ? undefined : parseInt(task_id, 10),
        task_name,
        description,
        user_id: user_id,
        story_point: story_point == undefined ? undefined : parseInt(story_point, 10),
        taskpriority_id: taskpriority_id == undefined ? undefined : parseInt(taskpriority_id, 10),
        tasktype_id: tasktype_id == undefined ? undefined : parseInt(tasktype_id, 10),
        taskstage_id: taskstage_id == undefined ? undefined : parseInt(taskstage_id, 10),
        taskstatus_id: taskstatus_id == undefined ? undefined : parseInt(taskstatus_id, 10)
      };
      //!!! Temporary way to create query that can retrieve display names. Replace with more robust approach later !!!
      // Removes undefined fields
      const fields = Object.keys(tasks).filter(key => tasks[key] !== undefined);
      // Adds the values to an array for the Pool query request
      const values = fields.map(key => tasks[key]);
      // Builds the WHERE clause
      const whereClause = fields.length === 0 ? "" : " AND " + fields.map((field, index) => {
        return values[index] === null 
            ? `t.${field} IS NULL` 
            : `t.${field} = $${index + 1}`;
        }).join(' AND ');
      // Builds query and sends to database
      const response = await db_pool.query(
        `SELECT t.task_id,
        t.task_name,
        t.description,
        t.user_id,
        m.user_name AS user_name,
        t.story_point,
        t.taskpriority_id,
        tp.priority_name AS priority_name,
        t.tasktype_id,
        tt.type_name AS type_name,
        t.taskstage_id,
        ts.stage_name AS stage_name,
        t.taskstatus_id,
        ts2.status_name AS status_name
        FROM Task t
        LEFT JOIN SysUser m ON t.user_id = m.user_id
        LEFT JOIN TaskPriority tp ON t.taskpriority_id = tp.taskpriority_id
        LEFT JOIN TaskType tt ON t.tasktype_id = tt.tasktype_id
        LEFT JOIN TaskStage ts ON t.taskstage_id = ts.taskstage_id
        LEFT JOIN TaskStatus ts2 ON t.taskstatus_id = ts2.taskstatus_id 
        LEFT JOIN JT_SprintTask jtst ON t.task_id = jtst.task_id
        WHERE jtst.task_id IS NULL
        ${whereClause}`,
        values
      );

      for (let i = 0; i < response.rows.length; i++) {
        // Retrieve task tags
        const tagResponse = await db_pool.query(
          `SELECT t.tasktag_id, t.tag_name
            FROM JT_TaskTags j
              JOIN TaskTag t ON j.tasktag_id = t.tasktag_id
                WHERE j.task_id = $1;`,
          [response.rows[i].task_id]
        );
        
        response.rows[i].task_tags = tagResponse.rows

        // Tokenize user IDs
        response.rows[i].user_id = generateUserToken(response.rows[i].user_id);
      }

      if (response.rows.length === 0) {
        res.status(204).json();
      } else {
        res.status(200).json(response);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json(err.message);        
    };
  }
);


/*
Adds a new task
- Requires a JSON object with all non-optional fields assigned
*/
app.post("/tasks",
  // Data validation
  body('task_name').isString().withMessage('Task Name must be a string').notEmpty().withMessage('Task Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('user_token').optional().custom(value => {
    if (value === null || typeof value === 'string') {
      return true;
    }
    throw new Error('User token must be a string or null');
  }),
  body('story_point').isInt().withMessage('Story Point must be an integer'),
  body('taskpriority_id').isInt().withMessage('Task Priority ID must be an integer'),
  body('tasktype_id').isInt().withMessage('Task Type ID must be an integer'),
  body('taskstage_id').isInt().withMessage('Task Stage ID must be an integer'),
  body('taskstatus_id').isInt().withMessage('Task Status ID must be an integer'),
  async(req, res) => {
    // Responds with validation error messages
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Attempts to send SQL query to database
    try {
      const { 
        task_name,
        description = undefined,
        user_token,
        story_point,
        taskpriority_id,
        tasktype_id,
        taskstage_id,
        taskstatus_id
      } = req.body;

      // const user_id = user_token == undefined ? undefined : decodeUserToken(user_token)?.user_id;
      // if (!user_id && user_token != undefined) {
      //   return res.status(400).json({ message: "User token is invalid." });
      // }

      let user_id = user_token;
      if (user_id !== null) {
        user_id = user_token == undefined ? undefined : decodeUserToken(user_token)?.user_id;
        if (!user_id && user_token != undefined) {
          return res.status(400).json({ message: "User token is invalid." });
        }
      }

      const newTask = { 
        task_name,
        description,
        user_id: user_id,
        story_point: parseInt(story_point, 10),
        taskpriority_id: parseInt(taskpriority_id, 10),
        tasktype_id: parseInt(tasktype_id, 10),
        taskstage_id: parseInt(taskstage_id, 10),
        taskstatus_id: parseInt(taskstatus_id, 10)
      };

      // Builds query and sends to database
      const { query, values } = insertQuery("Task", newTask);
      const response = await db_pool.query(query + " RETURNING task_id", values);

      res.status(201).json(response);
    } catch (err) {
      console.error(err.message);
      res.status(500).json(err.message);
    };
  }
);

/*
Updates an existing task based on its task ID
- Able to update any number of fields at once

--- Example usage for body parameters ---
Body sent in fetch request:
  {
    "task_id": 5,
    "task_name": "Update Query"
  }
- This will search for a task with task_id 5 and updates its task_name to "Update Query"
*/
app.patch('/tasks',
  body('task_id').isInt().withMessage('Task ID must be an integer'),
  body('task_name').optional().isString().withMessage('Task Name must be a string'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('user_token').optional().custom(value => {
    if (value === null || typeof value === 'string') {
      return true;
    }
    throw new Error('User token must be a string or null');
  }),
  body('story_point').optional().isInt().withMessage('Story Point must be an integer'),
  body('taskpriority_id').optional().isInt().withMessage('Task Priority ID must be an integer'),
  body('tasktype_id').optional().isInt().withMessage('Task Type ID must be an integer'),
  body('taskstage_id').optional().isInt().withMessage('Task Stage ID must be an integer'),
  body('taskstatus_id').optional().isInt().withMessage('Task Status ID must be an integer'),
  async(req, res) => {
    // Responds with validation error messages
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Attempts to send SQL query to database
    try {
      const { 
        task_id,
        task_name = undefined,
        description = undefined,
        user_token,
        story_point = undefined,
        taskpriority_id = undefined,
        tasktype_id = undefined,
        taskstage_id = undefined,
        taskstatus_id = undefined
      } = req.body;

      let user_id = user_token;
      if (user_id !== null) {
        user_id = user_token == undefined ? undefined : decodeUserToken(user_token)?.user_id;
        if (!user_id && user_token != undefined) {
          return res.status(400).json({ message: "User token is invalid." });
        }
      }

      const taskToUpdate = { 
        task_id: parseInt(task_id, 10),
        task_name,
        description,
        user_id: user_id,
        story_point: story_point == undefined ? undefined : parseInt(story_point, 10),
        taskpriority_id: taskpriority_id == undefined ? undefined : parseInt(taskpriority_id, 10),
        tasktype_id: tasktype_id == undefined ? undefined : parseInt(tasktype_id, 10),
        taskstage_id: taskstage_id == undefined ? undefined : parseInt(taskstage_id, 10),
        taskstatus_id: taskstatus_id == undefined ? undefined : parseInt(taskstatus_id, 10)
      };

      // Checks if there are any valid changes
      if (Object.keys(taskToUpdate).length == 1) {
        res.status(400).json("No valid fields to change.")
      }

      // Builds and sends query to database
      const { query, values} = updateQuery("Task", taskToUpdate, { "task_id" : taskToUpdate.task_id });
      const response = await db_pool.query(query, values);

      res.status(200).json(response);
    } catch (err) {
      console.error(err.message);
      res.status(500).json(err.message);
    };
  }
);

/*
Deletes all tasks or tasks based on provided URL search queries (for now it can only search for exact values)
- Unable to delete all tasks
- Fields that do not exist in the table will be ignored

--- Example usage for search parameters ---
Query sent in fetch request:
  {
    "task_id": 5,
    "task_name": "Delete Query"
  }
- This will search for and delete the tasks with task_id 5 and a task_name of "Delete Query"
*/
app.delete('/tasks',
  // Data validation
  query('task_id').optional().isInt().withMessage('Task ID must be an integer'),
  query('task_name').optional().isString().withMessage('Task Name must be a string'),
  query('description').optional().isString().withMessage('Description must be a string'),
  query('user_token').optional().custom(value => {
    if (value === null || typeof value === 'string') {
      return true;
    }
    throw new Error('User token must be a string or null');
  }),
  query('story_point').optional().isInt().withMessage('Story Point must be an integer'),
  query('taskpriority_id').optional().isInt().withMessage('Task Priority ID must be an integer'),
  query('tasktype_id').optional().isInt().withMessage('Task Type ID must be an integer'),
  query('taskstage_id').optional().isInt().withMessage('Task Stage ID must be an integer'),
  query('taskstatus_id').optional().isInt().withMessage('Task Status ID must be an integer'),
  async(req, res) => {
    // Responds with validation error messages
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Attempts to send SQL query to database
    try {
      const { 
        task_id = undefined,
        task_name = undefined,
        description = undefined,
        user_token,
        story_point = undefined,
        taskpriority_id = undefined,
        tasktype_id = undefined,
        taskstage_id = undefined,
        taskstatus_id = undefined
      } = req.query;

      let user_id = user_token == "null" ? null : user_token;
      if (user_id !== null) {
        user_id = user_token == undefined ? undefined : decodeUserToken(user_token)?.user_id;
        if (!user_id && user_token != undefined) {
          return res.status(400).json({ message: "User token is invalid." });
        }
      }

      const taskToDelete = { 
        task_id: task_id == undefined ? undefined : parseInt(task_id, 10),
        task_name,
        description,
        user_id: user_id,
        story_point: story_point == undefined ? undefined : parseInt(story_point, 10),
        taskpriority_id: taskpriority_id == undefined ? undefined : parseInt(taskpriority_id, 10),
        tasktype_id: tasktype_id == undefined ? undefined : parseInt(tasktype_id, 10),
        taskstage_id: taskstage_id == undefined ? undefined : parseInt(taskstage_id, 10),
        taskstatus_id: taskstatus_id == undefined ? undefined : parseInt(taskstatus_id, 10)
      };

      if (Object.keys(taskToDelete).filter(key => taskToDelete[key] !== undefined).length === 0) {
        res.status(400).json("No valid queries detected. Unable to search for any task records.");
        return;
      }
      // Builds query and sends to database
      const { query, values } = deleteQuery("Task", taskToDelete);
      const response = await db_pool.query(query, values);

      res.status(204).json(response);
    } catch (err) {
      console.error(err.message);
      res.status(500).json(err.message);
    };
  }
);

/*
--------------------- Task Tag Routes ---------------------
*/

/*
Adds new tags to task
*/
app.post("/tasks/tags",
  // Data validation
  body('task_id').isInt().withMessage('Task ID must be an integer').notEmpty().withMessage('Task ID is required'),
  body('task_tags').isArray().withMessage('Task tags must be stored in an array').notEmpty().withMessage('Task tag array is required'),
  async(req, res) => {
    // Responds with validation error messages
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Attempts to send SQL query to database
    try {
      const { 
        task_id,
        task_tags
      } = req.body;

      const tagsToAdd = { 
        task_id: parseInt(task_id, 10),
        task_tags
      };

      if (tagsToAdd.task_tags.length === 0) {
        res.status(400).json("No tags in given array.")
        return;
      }

      for (let i = 0; i < tagsToAdd.task_tags.length; i++) {
        if (!Number.isInteger(parseInt(tagsToAdd.task_tags[i]))) {
          res.status(400).json("All tag IDs must be integer.")
          return;
        }
      }

      // Build and execute queries for each tag
      for (const tasktag_id of tagsToAdd.task_tags) {
        const tagEntryToAdd = { "task_id": tagsToAdd.task_id, "tasktag_id": tasktag_id };
  
        const { query, values } = insertQuery("jt_tasktags", tagEntryToAdd);
        await db_pool.query(query, values);
      }

      // !!! Add proper response message later !!!
      res.status(201).json("Successful query.");
    } catch (err) {
      console.error(err.message);
      res.status(500).json(err.message);
    };
  }
);

// Gets all tags attached to a specific task ID
app.get('/tasks/tags',
  // Data validation
  query('task_id').isInt().withMessage('Task ID must be an integer'),
  async(req, res) => {
    // Responds with validation error messages
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Attempts to send SQL query to database
    try {
      const { 
        task_id = undefined,
      } = req.query;

      const task = { 
        task_id: parseInt(task_id, 10),
      };
      
      // Builds query and sends to database
      const { query, filteredValues: values } = searchQuery("jt_tasktags", task);
      const response = await db_pool.query(query, values);

      if (response.rows.length === 0) {
        res.status(204).json(response);
      } else {
        res.status(200).json(response);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json(err.message);        
    };
  }
);

/*
  Deletes all tags of task
*/
app.delete('/tasks/tags',
  // Data validation
  query('task_id').isInt().withMessage('Task ID must be an integer'),
  async(req, res) => {
    // Responds with validation error messages
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Attempts to send SQL query to database
    try {
      const { 
        task_id,
      } = req.query;

      const tagsToDelete = { 
        task_id: parseInt(task_id, 10),
      };

      // Builds query and sends to database
      const { query, values } = deleteQuery("JT_TaskTags", tagsToDelete);
      console.log(query)
      console.log(task_id)
      console.log(values)
      const response = await db_pool.query(query, values);

      res.status(204).json(response);
    } catch (err) {
      console.error(err.message);
      res.status(500).json(err.message);
    };
  }
);

/*
--------------------- Task Lookup Routes ---------------------
*/
// Gets task tags
app.get('/tasks/tag_lookup',
  // Data validation
  async(req, res) => {
    try {
      // Builds query and sends to database
      const response = await db_pool.query(`SELECT * FROM tasktag`);

      if (response.rows.length === 0) {
        res.status(204).json(response);
      } else {
        res.status(200).json(response);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json(err.message);        
    };
  }
);
// Gets task priorities
app.get('/tasks/priority_lookup',
  // Data validation
  async(req, res) => {
    try {

      // Builds query and sends to database
      const response = await db_pool.query(`SELECT * FROM taskpriority`);

      if (response.rows.length === 0) {
        res.status(204).json(response);
      } else {
        res.status(200).json(response);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json(err.message);        
    };
  }
);

// Gets task types
app.get('/tasks/type_lookup',
  // Data validation
  async(req, res) => {
    try {

      // Builds query and sends to database
      const response = await db_pool.query(`SELECT * FROM tasktype`);

      if (response.rows.length === 0) {
        res.status(204).json(response);
      } else {
        res.status(200).json(response);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json(err.message);        
    };
  }
);

// Gets task stages
app.get('/tasks/stage_lookup',
  // Data validation
  async(req, res) => {
    try {

      // Builds query and sends to database
      const response = await db_pool.query(`SELECT * FROM taskstage`);

      if (response.rows.length === 0) {
        res.status(204).json(response);
      } else {
        res.status(200).json(response);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json(err.message);        
    };
  }
);

// Gets task priorities
app.get('/tasks/status_lookup',
  // Data validation
  async(req, res) => {
    try {

      // Builds query and sends to database
      const response = await db_pool.query(`SELECT * FROM taskstatus`);

      if (response.rows.length === 0) {
        res.status(204).json(response);
      } else {
        res.status(200).json(response);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json(err.message);        
    };
  }
);

app.use('', userRoutes); 
app.use('', historyRoutes);
app.use('', sprintRoutes);
app.use('', teamBoardRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});