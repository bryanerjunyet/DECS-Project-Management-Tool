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
Adds a new task history entry for a specific task
- Also assigns the task entry to the task when created
- datetime must be in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ) with both date and time
- Default datetime follows UTC+8 timezone
*/
router.post("/tasks/history",
    // Input validation
    body('task_id').isInt().withMessage('Task ID must be an integer').notEmpty().withMessage('Task ID is required'),
    body('description').isString().withMessage('History description must be a string').notEmpty().withMessage('History description is required'),
    body('user_token').isString().withMessage('User token must be a string').notEmpty().withMessage('User token is required'),
    body('datetime')
        .optional()
        .isISO8601({ strict: true })
        .withMessage('DateTime be a valid ISO 8601 date and time')
        .custom((value) => {
        const date = new Date(value);
        // Check if time is included
        if (!value.includes('T')) {
            throw new Error('DateTime include time in the format YYYY-MM-DDTHH:mm:ss');
        }
        if (isNaN(date.getTime())) {
            throw new Error('DateTime is invalid');
        }
        return true;
        })
        .toDate(),
    body('status_id').isInt().withMessage('History Status ID must be an integer').notEmpty().withMessage('History Status ID is required'),
    async(req, res) => {
        // Responds with validation error messages
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        const client = await db_pool.connect();

        // Attempts to send SQL query to database
        try {
            const { 
                task_id,
                description,
                user_token,
                datetime = undefined,
                status_id
            } = req.body;

            // Decodes user token to user ID
            let user_id = user_token;
            user_id = decodeUserToken(user_token)?.user_id;
            if (!user_id) {
                return res.status(400).json({ message: "User token is invalid." });
            }

            const histAssign = {
                task_id: parseInt(task_id, 10),
            };

            const histEntry = { 
                description,
                user_id: user_id,
                histentry_date: datetime === undefined ? convertToUTC8(new Date().toISOString()) : datetime,
                histentrystatus_id: parseInt(status_id, 10)
            };

            await client.query('BEGIN');

            // Saves history entry
            const { query, values } = insertQuery("HistoryEntry", histEntry);
            const response = await client.query(query + " RETURNING histentry_id", values);

            // Assigns history entry to task
            histAssign.histentry_id = response.rows[0].histentry_id;
            const { query: assignQuery, values: assignValues } = insertQuery("JT_TaskHistory", histAssign);
            await client.query(assignQuery, assignValues);

            await client.query('COMMIT');

            res.status(201).json({histentry_id: histAssign.histentry_id});
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(err.message);
            res.status(500).json(err.message);
        } finally {
            if (client)
                client.release();
        };
    }
);

/*
Gets all history entries of a task
*/
router.get('/tasks/history',
  // Input validation
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

      const taskToSearch = { 
        task_id
      };

      // Retrieves full task history details
      const response = await db_pool.query(
        `SELECT 
            h.task_id, 
            he.histentry_id, 
            he.description, 
            he.user_id, 
            he.histentry_date, 
            hes.status_name,
            su.user_name
        FROM JT_TaskHistory h
            JOIN HistoryEntry he ON h.histentry_id = he.histentry_id
            JOIN HistoryEntryStatus hes ON he.histentrystatus_id = hes.histentrystatus_id
            JOIN SysUser su ON he.user_id = su.user_id 
        WHERE h.task_id = $1`,
        [taskToSearch.task_id]
      );

      for (let i = 0; i < response.rows.length; i++) {
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
Gets the creation date of a task

--- Input ---
user_token (Int) [Required]: Used to specify which task's creation date you want to retrieve

--- Output ---
Status 200: Creation date retrieved successfully
    Returns: {creation_date: creation date of the task, in ISO string format}

Status 204: No creation log for this task
    Returns: Nothing

Status 400: Incorrect format for some input
    Returns: Object -> {errors: tells you what input is incorrect}

*/
router.get('/tasks/history/creation_date',
  // Input validation
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

      const taskToSearch = { 
        task_id
      };

      // Retrieves full task history details
      const response = await db_pool.query(
        `SELECT he.histentry_date
        FROM JT_TaskHistory jth
          JOIN HistoryEntry he ON jth.histentry_id = he.histentry_id
          JOIN HistoryEntryStatus hes ON he.histentrystatus_id = hes.histentrystatus_id
        WHERE jth.task_id = $1 AND hes.histentrystatus_id = 1`,
        [taskToSearch.task_id]
      );

      if (response.rows.length === 0) {
        res.status(204).json();
      } else {
        res.status(200).json({creation_date: response.rows[0].histentry_date});
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json(err.message);        
    };
  }
);


module.exports = router;