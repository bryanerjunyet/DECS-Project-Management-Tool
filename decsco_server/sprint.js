const express = require('express');
const router = express.Router();
const { query, body, validationResult } = require('express-validator');
const { insertQuery, searchQuery, deleteQuery, updateQuery } = require("./query-builders");

const db_pool = require("./database"); 
const {generateUserToken, decodeUserToken, compareUserTokens} = require('./auth');

/*
Converts default ISO strings to UTC+8 timezone
*/
function convertToUTC8(isoString) {
    const date = new Date(isoString);

    // Convert to UTC+8 by adding 8 hours in milliseconds
    const convertedDate = new Date(date.getTime() + (8 * 60 * 60 * 1000));

    return convertedDate.toISOString();
}

/*
Retrieves full sprint details
*/
router.get("/sprints",
    // Input validation
    query('sprint_id').optional().isInt().withMessage('Sprint ID must be an integer'),
    query('sprint_name').optional().isString().withMessage('Sprint Name must be a string'),
    query('start_date').optional().isISO8601({ strict: true }).withMessage('Start date must be in ISO 8601 format'),
    query('end_date').optional().isISO8601({ strict: true }).withMessage('End date must be in ISO 8601 format'),
    query('sprintstatus_id').optional().isInt().withMessage('Status ID must be an integer'),
    async(req, res) => {
        // Responds with validation error messages
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        // Attempts to send SQL query to database
        try {
        const { 
            sprint_id = undefined,
            sprint_name = undefined,
            start_date = undefined,
            end_date = undefined,
            sprintstatus_id = undefined,
        } = req.query;
    
        const sprints = { 
            sprint_id: sprint_id == undefined ? undefined : parseInt(sprint_id, 10),
            sprint_name,
            start_date: start_date ? start_date.split('Z')[0] : undefined,
            end_date: end_date ? end_date.split('Z')[0] : undefined,
            sprintstatus_id: sprintstatus_id == undefined ? undefined : parseInt(sprintstatus_id, 10),
        };
        //!!! Temporary way to create query that can retrieve display names. Replace with more robust approach later !!!
        // Removes undefined fields
        const fields = Object.keys(sprints).filter(key => sprints[key] !== undefined);
        // Adds the values to an array for the Pool query request
        const values = fields.map(key => sprints[key]);
        // Builds the WHERE clause
        const whereClause = fields.length === 0 ? "" : " WHERE " + fields.map((field, index) => {
            return values[index] === null 
                ? `s.${field} IS NULL` 
                : `s.${field} = $${index + 1}`;
            }).join(' AND ');
        // Builds query and sends to database
        const response = await db_pool.query(
            `SELECT 
                s.sprint_id,
                s.sprint_name,
                s.start_date,
                s.end_date,
                s.sprintstatus_id,
                ss.status_name
            FROM 
                Sprint s
            JOIN SprintStatus ss ON s.sprintstatus_id = ss.sprintstatus_id
            ${whereClause}`,
            values
        );
        if (response.rows.length === 0) {
            res.status(204).json();
        } else {
            for (const i in response.rows) {
                response.rows[i] = {...response.rows[i],
                    // display_start_date: convertToUTC8(response.rows[i].start_date.toISOString()).replace("T", " ").replace("Z", "").split(".")[0],
                    // display_end_date: convertToUTC8(response.rows[i].end_date.toISOString()).replace("T", " ").replace("Z", "").split(".")[0]
                    display_start_date: convertToUTC8(response.rows[i].start_date.toISOString()).split("T")[0],
                    display_end_date: convertToUTC8(response.rows[i].end_date.toISOString()).split("T")[0],
                }
            }
            res.status(200).json(response);
        }
        } catch (err) {
        console.error(err.message);
        res.status(500).json(err.message);        
        };
    }
);

/*
Adds a new sprint
- start_date and end_date must be in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)
*/
router.post("/sprints",
    // Input validation
    body('sprint_name').isString().withMessage('Sprint name must be a string').notEmpty().withMessage('Sprint name is required'),
    body('start_date').isISO8601({ strict: true }).withMessage('Start date must be a valid ISO 8601 date and time').notEmpty().withMessage('Start date is required'),
    body('end_date').isISO8601({ strict: true }).withMessage('End date must be a valid ISO 8601 date and time').notEmpty().withMessage('End date is required'),
    body('sprintstatus_id').isInt().withMessage('Sprint status ID must be an integer').notEmpty().withMessage('Sprint status ID is required'),
    async(req, res) => {
        // Responds with validation error messages
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        // Attempts to send SQL query to database
        try {
            const { 
                sprint_name,
                start_date,
                end_date,
                sprintstatus_id
            } = req.body;

            const newSprint = { 
                sprint_name,
                start_date: convertToUTC8(start_date),
                end_date: convertToUTC8(end_date),
                sprintstatus_id: parseInt(sprintstatus_id, 10)
            };

            // Saves the sprint
            const { query, values } = insertQuery("Sprint", newSprint);
            const response = await db_pool.query(query + " RETURNING sprint_id", values);

            res.status(201).json(response.rows[0]);
        } catch (err) {
            console.error(err.message);
            res.status(500).json(err.message);
        }
    }
);

/*
Updates the sprint details of a specified sprint
*/
router.patch('/sprints',
    body('sprint_id').isInt().withMessage('Sprint ID must be an integer'),
    body('sprint_name').optional().isString().withMessage('Sprint Name must be a string'),
    body('start_date').optional().isISO8601({ strict: true }).withMessage('Start date must be a valid ISO 8601 date and time'),
    body('end_date').optional().isISO8601({ strict: true }).withMessage('End date must be a valid ISO 8601 date and time'),
    body('sprintstatus_id').optional().isInt().withMessage('Sprint status ID must be an integer'),
    async(req, res) => {
      // Responds with validation error messages
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      // Attempts to send SQL query to database
      try {
        const { 
          sprint_id,
          sprint_name = undefined,
          start_date = undefined,
          end_date = undefined,
          sprintstatus_id = undefined
        } = req.body;
  
        const sprintToUpdate = { 
          sprint_id: parseInt(sprint_id, 10),
          sprint_name,
          start_date: start_date ? convertToUTC8(start_date) : undefined,
          end_date: end_date ? convertToUTC8(end_date) : undefined,
          sprintstatus_id: !sprintstatus_id ? undefined : parseInt(sprintstatus_id, 10),
        };

        // Checks if there are any valid changes
        if (Object.keys(sprintToUpdate).length == 1) {
          res.status(400).json("No valid fields to change.")
        }
  
        // Builds and sends query to database
        const { query, values} = updateQuery("Sprint", sprintToUpdate, { "sprint_id" : sprintToUpdate.sprint_id });
        const response = await db_pool.query(query, values);
  
        res.status(200).json(response);
      } catch (err) {
        console.error(err.message);
        res.status(500).json(err.message);
      };
    }
);

/*
Removes a specified sprint
*/
router.delete('/sprints',
    // Data validation
    query('sprint_id').isInt().withMessage('Sprint ID must be an integer'),
    async(req, res) => {
      // Responds with validation error messages
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // Attempts to send SQL query to database
      try {
        const { 
          sprint_id
        } = req.query;
  
        const sprintToDelete = { 
          sprint_id
        };
  
        // Builds query and sends to database
        const { query, values } = deleteQuery("Sprint", sprintToDelete);
        const response = await db_pool.query(query, values);
  
        res.status(204).json(response);
      } catch (err) {
        console.error(err.message);
        res.status(500).json(err.message);
      };
    }
);

/*
Retrieves all sprint tasks of a sprint
*/
router.get('/sprints/tasks',
    // Input validation
    query('sprint_id').isInt().withMessage('Sprint ID must be an integer').notEmpty().withMessage('Sprint ID is required'),
    query('taskstatus_id').optional().isInt().withMessage('Task status ID must be an integer'),
    async(req, res) => {
        // Responds with validation error messages
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        // Attempts to send SQL query to database
        try {
        const { 
            sprint_id,
            taskstatus_id = undefined
        } = req.query;
    
        const sprintTasks = { 
            sprint_id: sprint_id,
            taskstatus_id: taskstatus_id ? parseInt(taskstatus_id, 10) : undefined
        };

        //!!! Temporary way to create query that can retrieve display names. Replace with more robust approach later !!!
        // Removes undefined fields
        const fields = Object.keys(sprintTasks).filter(key => sprintTasks[key] !== undefined);
        // Adds the values to an array for the Pool query request
        const values = fields.map(key => sprintTasks[key]);
        // Builds the WHERE clause
        const whereClause = fields.length === 0 ? "" : " WHERE " + fields.map((field, index) => {
            if (field.startsWith('task')) {
                return values[index] === null 
                    ? `t.${field} IS NULL` 
                    : `t.${field} = $${index + 1}`;
            } else {
                return values[index] === null 
                    ? `jst.${field} IS NULL` 
                    : `jst.${field} = $${index + 1}`;
            }
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
                ts2.status_name AS status_name,
                jst.sprint_id,
                jst.jt_sprinttask_id
            FROM Task t
            LEFT JOIN SysUser m ON t.user_id = m.user_id
            LEFT JOIN TaskPriority tp ON t.taskpriority_id = tp.taskpriority_id
            LEFT JOIN TaskType tt ON t.tasktype_id = tt.tasktype_id
            LEFT JOIN TaskStage ts ON t.taskstage_id = ts.taskstage_id
            LEFT JOIN TaskStatus ts2 ON t.taskstatus_id = ts2.taskstatus_id
            LEFT JOIN JT_SprintTask jst ON t.task_id = jst.task_id
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
        }    


        if (response.rows.length === 0) {
            res.status(204).json();
        } else {
            // for (const i in response.rows) {
            //     response.rows[i] = {...response.rows[i],
            //         display_start_date: convertToUTC8(response.rows[i].start_date.toISOString()).replace("T", " ").replace("Z", "").split(".")[0],
            //         display_end_date: convertToUTC8(response.rows[i].end_date.toISOString()).replace("T", " ").replace("Z", "").split(".")[0]
            //     }
            // }
            res.status(200).json(response);
        }
        } catch (err) {
        console.error(err.message);
        res.status(500).json(err.message);        
        };
    }
);

/*
Adds sprint assignment to task
- Use this only for an initial assignment, if task is already assigned to a sprint, use PATCH instead
*/
router.post('/sprints/tasks',
    // Input validation
    body('sprint_id').isInt().withMessage('Sprint ID must be an integer').notEmpty().withMessage('Sprint ID is required'),
    body('task_id').isInt().withMessage('Task ID must be an integer').notEmpty().withMessage('Task ID is required'),
    body('time_taken').optional().isInt().withMessage('Time taken must be an integer'),
    async(req, res) => {
        // Responds with validation error messages
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        // Attempts to send SQL query to database
        try {
            const { 
                sprint_id,
                task_id,
                time_taken = undefined
            } = req.body;

            const newSprintTask = { 
                sprint_id: parseInt(sprint_id, 10),
                task_id: parseInt(task_id, 10),
                time_taken: time_taken ? parseInt(time_taken, 10) : undefined
            };

            // Saves the sprint
            const { query, values } = insertQuery("JT_SprintTask", newSprintTask);
            const response = await db_pool.query(query + " RETURNING jt_sprinttask_id", values);

            res.status(201).json(response.rows[0]);
        } catch (err) {
            console.error(err.message);
            res.status(500).json(err.message);
        }
    }
);

/*
Removes all sprint assignments from task
- Use this to move task to product backlog
*/
router.delete('/sprints/tasks',
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
        task_id
      } = req.query;

      const assignToDelete = { 
        task_id
      };

      // Builds query and sends to database
      const { query, values } = deleteQuery("JT_SprintTask", assignToDelete);
      const response = await db_pool.query(query, values);

      res.status(204).json(response);
    } catch (err) {
      console.error(err.message);
      res.status(500).json(err.message);
    };
  }
);

/*
Updates sprint task details
- Use this to reassign task to a different sprint without using backlog or update the timer
*/
router.patch('/sprints/tasks',
    body('task_id').isInt().withMessage('Task ID must be an integer'),
    body('sprint_id').optional().isInt().withMessage('Sprint ID must be an integer'),
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
            sprint_id = undefined,
        } = req.body;
  
        const taskToUpdate = { 
            task_id,
            sprint_id: sprint_id ? parseInt(sprint_id, 10) : undefined,
        };
  
        // Checks if there are any valid changes
        if (Object.keys(taskToUpdate).length == 1) {
          res.status(400).json("No valid fields to change.")
        }
  
        // Builds and sends query to database
        const { query, values} = updateQuery("JT_SprintTask", taskToUpdate, { "task_id" : taskToUpdate.task_id });
        const response = await db_pool.query(query, values);
  
        res.status(200).json(response);
      } catch (err) {
        console.error(err.message);
        res.status(500).json(err.message);
      };
    }
);



router.get('/sprints/tasks/time',
    // Input validation
    query('user_token').isString().withMessage('User token must be a string'),
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
                user_token,
                task_id
            } = req.query;
        
            const userTime = { 
                user_id: user_token,
                task_id: parseInt(task_id, 10)
            };

            if (user_token != undefined) {
                const decodedToken = decodeUserToken(userTime.user_id)?.user_id;
                if (decodedToken === null) {
                    return res.status(400).json({ message: "User token is invalid."});
                };
                userTime.user_id = decodedToken;
            } 

            // Builds query and sends to database
            const { query, filteredValues: values } = searchQuery("jt_usertime", userTime);
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

router.post('/sprints/tasks/time',
    body('user_token').isString().withMessage('User token must be a string'),
    body('task_id').isInt().withMessage('Task ID must be an integer'),
    body('time_taken').isInt().withMessage('Time taken must be an integer'),
    async(req, res) => {
        // Responds with validation error messages
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        try {
            // Assign body parameters to local variables
            const { 
                user_token,
                task_id,
                time_taken
            } = req.body;

            const userTime = { 
                user_id: user_token,
                task_id: parseInt(task_id, 10),
                time_taken: parseInt(time_taken, 10)
            };

            if (user_token != undefined) {
                const decodedToken = decodeUserToken(userTime.user_id)?.user_id;
                if (decodedToken === null) {
                    return res.status(400).json({ message: "User token is invalid."});
                };
                userTime.user_id = decodedToken;
            } 

            const { query, values } = insertQuery("JT_UserTime", userTime);
            const response = await db_pool.query(query + " RETURNING jt_usertime_id", values);

            res.status(201).json(response);
        } catch (err) {
            console.error(err.message);
            res.status(500).json(err.message);
        }        
    }
);

router.patch('/sprints/tasks/time',
    body('user_token').isString().withMessage('User token must be a string'),
    body('task_id').isInt().withMessage('Task ID must be an integer'),
    body('time_taken').isInt().withMessage('Time taken must be an integer'),
    async(req, res) => {
        // Responds with validation error messages
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    
        // Attempts to send SQL query to database
        try {
            const { 
                user_token,
                task_id,
                time_taken,
            } = req.body;
    
            const userTime = { 
                user_id: user_token,
                task_id: parseInt(task_id, 10),
                time_taken: parseInt(time_taken, 10)
            };

            if (user_token != undefined) {
                const decodedToken = decodeUserToken(userTime.user_id)?.user_id;
                if (decodedToken === null) {
                    return res.status(400).json({ message: "User token is invalid."});
                };
                userTime.user_id = decodedToken;
            } 
    
            // Builds and sends query to database
            const { query, values} = updateQuery("JT_UserTime", {"time_taken": userTime.time_taken}, { "task_id" : userTime.task_id, "user_id" : userTime.user_id });
            const response = await db_pool.query(query, values);
    
            res.status(200).json(response);
        } catch (err) {
            console.error(err.message);
            res.status(500).json(err.message);
        };
    }
);

module.exports = router;
