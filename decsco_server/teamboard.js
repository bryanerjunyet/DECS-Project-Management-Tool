const express = require('express');
const crypto = require('crypto');
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
Retrieves the team board data for a specific user
- Will only retrieve details for users with time logged during the specified period
- Includes work time for each day worked
- Will only consider date, and will ignore time data

--- Input ---
user_token (String) [Required]: Used to specify which user's team board you want to get
start_date (ISO String) [Required]: Starting date of the selected period of work time. Will select all dates starting from the beginning of this day
end_date (ISO String) [Required]: Ending date of the selected period of work time. Will select all dates ending at the end of this day
self (Boolean) [Optional]: If set to true, will only retrieve the user's work time only, regardless of role.

--- Output ---
Status 200: Work time successfully retrieved
    Returns: Array of user work times (all valid users for admin, only the user for team members)
        Structure of each user work time:
        {
            total_time: (Integer) Total time worked during the period, in seconds
            user_name: (String) Username of user
            user_token: (String) User token of user
            work_time_day:
            {
                date: (String, YYYY-MM-DD) Day of work
                work_time: (Integer) Total time worked during the date, in seconds
            }
        }

Status 204: No work time within the specified time period
    Returns: Nothing

Status 400: Incorrect format for some input
    Returns: Object -> {errors: tells you what input is incorrect}

Status 404: User does not exist, token is valid but for a user_id that is not in the database
    Returns: Object -> {message: String telling you that the user does not exist}
*/
router.get('/team_board',
    // Query validation
    query('user_token').isString().withMessage('User token must be a string').notEmpty().withMessage("User token is required."),
    query('start_date').isISO8601({ strict: true }).withMessage('Start date be a valid ISO 8601 date and time').notEmpty().withMessage("Start date is required."),
    query('end_date').isISO8601({ strict: true }).withMessage('End date be a valid ISO 8601 date and time').notEmpty().withMessage("End date is required."),
    query('self').optional().isBoolean().withMessage('Self flag must be boolean.'),
    async(req, res) => {
        // Responds with validation error messages
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Attempts to retrieve users from database
        try {
            // Assign query parameters to local variables
            let { 
                user_token,
                start_date,
                end_date,
                self
            } = req.query;

            self = self == "true";

            const userToSearch = {
                user_id: user_token
            };

            if (start_date > end_date) {
                return res.status(400).json({ message: "Start date must be before end date."});
            }

            start_date = convertToUTC8(start_date).split('T')[0];
            end_date = convertToUTC8(end_date).split('T')[0];
            
            // Moves end date up by a day to account for how dates with no time are interpreted as starting from 00:00:00
            const dateObject = new Date(end_date + 'T00:00:00Z');
            dateObject.setUTCDate(dateObject.getUTCDate() + 1);
            end_date = dateObject.toISOString().split('T')[0];



            // Finds total days between start and end date
            const startDateObject = new Date(start_date + 'T00:00:00Z');
            const endDateObject = new Date(end_date + 'T00:00:00Z');
            const differenceInMilliseconds = endDateObject - startDateObject;
            const totalDays = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));


            // Decodes user token into user ID
            const decodedToken = decodeUserToken(userToSearch.user_id)?.user_id;
            if (decodedToken === null) {
                return res.status(400).json({ message: "User token is invalid."});
            };
            userToSearch.user_id = decodedToken;

            // Checking user role
            let {query, filteredValues: values} = searchQuery('SysUser', userToSearch);
            console.log(query)
            const userResponse = await db_pool.query(query, values);
            if (userResponse.rows.length == 0) {
                return res.status(404).json({ message: "User does not exist."});
            }

            const role_id = userResponse.rows[0].role_id;

            // Constructs query based on user role
            if (role_id == 2 && self != true) { // Admin
                console.log("Admin GET");
                ({query, filteredValues: values} = searchQuery('JT_UserTime'));
                query += ` WHERE datetime BETWEEN '${start_date}' AND '${end_date}'`;
            } else {    // Team member
                console.log("Member GET");
                ({query, filteredValues: values} = searchQuery('JT_UserTime', userToSearch));
                query += ` AND datetime BETWEEN '${start_date}' AND '${end_date}'`;
            }
            console.log('c');

            console.log(query)
            // Gets work time for the specified period
            const timeResponse = await db_pool.query(query, values);

            if (timeResponse.rows.length == 0) {
                return res.status(204).json();
            }

            let userWorkTime = {}

            // Collects all work time details for each user
            timeResponse.rows.forEach(entry => {
                let { user_id, time_taken, datetime } = entry;
                datetime = datetime.toISOString();
                const date = datetime.split('T')[0];
        
                if (!userWorkTime[user_id]) {
                    userWorkTime[user_id] = {
                        user_id,
                        total_time: 0,
                        work_time_day: {}
                    };
                }
        

                // Adds work time to total work time
                userWorkTime[user_id].total_time += time_taken;
        
                // Adds up time for each work day
                if (!userWorkTime[user_id].work_time_day[date]) {
                    userWorkTime[user_id].work_time_day[date] = 0;
                }
                userWorkTime[user_id].work_time_day[date] += time_taken < 1 ? 
                    Math.round((time_taken / 3600) * 1000) / 1000 
                    : Math.round((time_taken / 3600) * 10) / 10;

 
            });

            // Formats user work time details
            userWorkTime = Object.values(userWorkTime).map(user => {
                return {
                    user_id: user.user_id,
                    total_time: user.total_time,
                    total_days: totalDays,
                    avg_work_hours: totalDays 
                        ? (user.total_time / totalDays / 3600 < 1 
                            ? Math.round((user.total_time / totalDays / 3600) * 1000) / 1000 
                            : Math.round((user.total_time / totalDays / 3600) * 10) / 10) 
                        : 0,
                    work_time_day: Object.entries(user.work_time_day).map(([date, work_time]) => ({
                        date,
                        work_time
                    }))
                };
            });

            for (let i = 0; i < userWorkTime.length; i++) {
                const userID = userWorkTime[i].user_id;
                ({query, filteredValues: values} = searchQuery("SysUser", {user_id: userID}, ["user_name"]));
                const userNameRes = await db_pool.query(query, values);
                userWorkTime[i].user_name = userNameRes.rows[0].user_name;

                // Tokenize user IDs
                userWorkTime[i].user_token = generateUserToken(userWorkTime[i].user_id);
                delete userWorkTime[i].user_id;
            }

            if (userWorkTime.length == 0) {
                res.status(204).json();
            } else {
                res.status(200).json(userWorkTime);
            }
        } catch (err) {
            console.error(err.message);
            res.status(500).json(err.message);
        };
    }
);

module.exports = router;