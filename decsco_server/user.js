const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { query, body, validationResult } = require('express-validator');
const { insertQuery, searchQuery, deleteQuery, updateQuery } = require("./query-builders");


const db_pool = require("./database"); 
const {generateUserToken, decodeUserToken, compareUserTokens} = require('./auth');

/*
Adds a new user
- Password will be hashed in database

--- Input ---
user_name (String) [Required]: Username of user
password (String) [Required]: Password of user
role_id (Int) [Required]: Role ID of user role

--- Output ---
Status 201: User creation successful
    Returns: {user_token: user token of newly created user. Use this to refer to the new user}

Status 400: Incorrect format for some input
    Returns: Object -> {errors: tells you what input is incorrect}
*/
router.post('/users',
    // Body validation
    body('user_name').isString().withMessage('Username must be a string').notEmpty().withMessage('Username is required'),
    body('password').isString().withMessage('Password must be a string').notEmpty().withMessage('Password is required'),
    body('role_id').isInt().withMessage('Role ID must be an integer').notEmpty().withMessage('Role is required'),
    async(req, res) => {
        // Responds with validation error messages
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        // Attempts to save new user to database
        try {
            // Assign body parameters to local variables
            const { 
                user_name,
                password,
                role_id
            } = req.body;
            
            const salt = crypto.randomBytes(16).toString('hex');

            const newUser = { 
                user_name,
                role_id: parseInt(role_id, 10),
                hashed_password: crypto.createHash('sha256').update(password + salt).digest('hex'),
                password_salt: salt
            };

            const { query, values } = insertQuery("SysUser", newUser);
            const response = await db_pool.query(query + " RETURNING user_id", values);
            
            // Tokenizes the user_id return
            response.rows[0].user_token = generateUserToken(response.rows[0].user_id);
            delete response.rows[0].user_id;

            res.status(201).json(response.rows[0]);
        } catch (err) {
            console.error(err.message);
            res.status(500).json(err.message);
        };
    }
);

/*
Retrieves user details
- Can retrieve either a single user or all user details
- For now, only can search by user ID (tokenized)

--- Input ---
user_token (String) [Optional]: User token used to represent user_id in the frontend

--- Output ---
Status 200: Users found
    Returns: Array of users

Status 204: No user found with token
    Returns: Nothing

Status 400: Incorrect format for some input
    Returns: Object -> {errors: tells you what input is incorrect}
*/
router.get('/users',
    // Query validation
    query('user_token').optional().isString().withMessage('User token must be a string'),
    async(req, res) => {
        // Responds with validation error messages
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        // Attempts to retrieve users from database
        try {
            // Assign query parameters to local variables
            const { 
                user_token = undefined
            } = req.query;

            const userToSearch = {
                user_id: user_token
            };
            
            if (user_token != undefined) {
                const decodedToken = decodeUserToken(userToSearch.user_id)?.user_id;
                if (decodedToken === null) {
                    return res.status(400).json({ message: "User token is invalid."});
                };
                userToSearch.user_id = decodedToken;
            } 
            console.log(userToSearch.user_id)
            //!!! Temporary way to create query that can retrieve display names. Replace with more robust approach later !!!
            // Removes undefined fields
            const fields = Object.keys(userToSearch).filter(key => userToSearch[key] !== undefined);
            // Adds the values to an array for the Pool query request
            const values = fields.map(key => userToSearch[key]);
            // Builds the WHERE clause
            const whereClause = fields.length === 0 ? "" : " WHERE " + fields.map((field, index) => {
                return values[index] === null 
                    ? `SysUser.${field} IS NULL` 
                    : `SysUser.${field} = $${index + 1}`;
                }).join(' AND ');
            // Builds query and sends to database
            const response = await db_pool.query(
                `SELECT 
                    SysUser.user_id,
                    SysUser.user_name,
                    Role.role_id,
                    Role.role_name
                FROM SysUser
                JOIN Role ON SysUser.role_id = Role.role_id
                ${whereClause}`,
                values
            );
            console.log(whereClause)

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
Deletes a user
- Prevents deletion if user has assigned tasks

--- Input ---
user_token (String) [Required]: User token used to represent user_id in the frontend

--- Output ---
Status 204: Deletion was successful
    Returns: Nothing

Status 409: Deletion was not successful; user still has assigned tasks
    Returns: Array of user's assigned tasks (includes task details)

Status 400: Incorrect format for some input
    Returns: Object -> {errors: tells you what input is incorrect}
*/
router.delete('/users', 
    // Body validation
    query('user_token').isString().withMessage('User token must be a string'),
    async(req, res) => {
        // Responds with validation error messages
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        // Attempts to delete user from database
        try {
            // Assign query parameters to local variables
            const { 
                user_token = undefined
            } = req.query;

            const userToSearch = {
                user_id: user_token
            };
            
            if (user_token != undefined) {
                const decodedToken = decodeUserToken(userToSearch.user_id)?.user_id;
                if (decodedToken === null) {
                    return res.status(400).json({ message: "User token is invalid."});
                };
                userToSearch.user_id = decodedToken;
            } 
            
            // Gets any tasks related to user for reassignment
            let {query, filteredValues: values} = searchQuery("Task", userToSearch);
            const taskRes = await db_pool.query(query, values);
            
            // Sends back user's tasks if there are any
            if (taskRes.rows.length > 0) {
               return res.status(409).json(taskRes.rows);
            }

            ({query, values} = deleteQuery("SysUser", userToSearch));
            await db_pool.query(query, values);
            return res.status(204).json();
        } catch (err) {
            console.error(err.message);
            res.status(500).json(err.message);
        };
    }
);

/*
Updates a user's details

--- Input ---
user_token (String) [Required]: The user to modify
user_name (String) [Optional]: User name to change to
password (String) [Optional]: Password to change to
role_id (Int) [Optional]: Role to change to

--- Output ---
Status 200: Successful modification
    Returns: Nothing

Status 400: Incorrect format for some input
    Returns: Object -> {errors: tells you what input is incorrect}
*/
router.patch('/users',
    // Body validation
    body('user_token').isString().withMessage('User token must be a string').notEmpty().withMessage('User token is required'),
    body('user_name').optional().isString().withMessage('Username must be a string'),
    body('password').optional().isString().withMessage('Password must be a string'),
    body('role_id').optional().isInt().withMessage('Role ID must be an integer'),
    async(req, res) => {
        // Responds with validation error messages
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        // Attempts to modify user in database
        try {
            // Assign body parameters to local variables
            const { 
                user_token,
                user_name = undefined,
                password = undefined,
                role_id = undefined
            } = req.body;

            const userToUpdate = { 
                user_id: user_token,
                user_name,
                password,
                role_id: role_id == undefined ? undefined : parseInt(role_id, 10),
            };

            // Checks if there are any valid changes
            if (Object.keys(userToUpdate).filter(key => userToUpdate[key] !== undefined).length <= 1) {
                return res.status(400).json({ message: "No valid fields to change."})
            }
            
            // Decodes user token to user ID
            const decodedToken = decodeUserToken(userToUpdate.user_id)?.user_id;
            if (decodedToken === null) {
                return res.status(400).json({ message: "User token is invalid."});
            };
            userToUpdate.user_id = decodedToken;

            if (password != undefined) {
                const salt = crypto.randomBytes(16).toString('hex');
                userToUpdate.hashed_password = crypto.createHash('sha256').update(userToUpdate.password + salt).digest('hex');
                userToUpdate.password_salt = salt;
                delete userToUpdate.password;
            }

            // Builds and sends query to database
            const { query, values} = updateQuery("SysUser", userToUpdate, { "user_id" : userToUpdate.user_id });
            const response = await db_pool.query(query, values);

            res.status(200).json();
        } catch (err) {
            console.error(err.message);
            res.status(500).json(err.message);
        };
    }
);

/*
    Compare user tokens
*/
router.get('/users/compare_tokens',
    // Body validation
    query('user_token_1').isString().withMessage('User tokens must be a string'),
    query('user_token_2').isString().withMessage('User tokens must be a string'),
    async(req, res) => {
        // Responds with validation error messages
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        const { 
            user_token_1,
            user_token_2
        } = req.query;

        try {
            const result = compareUserTokens(user_token_1, user_token_2);
            res.status(200).json({result});
        } catch (err) {
            console.error(err.message);
            res.status(500).json(err.message);
        };
    }
);

/*
    Retrieves the user's login token using login credentials
    - Can be used to verify login

    --- Input ---
    user_name (String) [Required]: User's username
    password (String) [Required]: User's password

    --- Output ---
    Status 200: User login successfully
        Returns: {
            user_token: User token used to represent the user ID,
            role_id: Role ID of the user (use this for anything that requires checking user role)
        }

    Status 401: User unauthorized; Either username or password is invalid
        Returns: {error: A string representing}

    Status 400: Incorrect format for some input
        Returns: Object -> {errors: tells you what input is incorrect}

*/
router.post('/login',
    body('user_name').isString().withMessage('Username must be a string').notEmpty().withMessage('Username is required'),
    body('password').isString().withMessage('Password must be a string').notEmpty().withMessage('Password is required'),
    async(req, res) => {
        // Responds with validation error messages
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }
        // Attempts to save new user to database
        try {
            // Assign body parameters to local variables
            const { 
                user_name,
                password,
            } = req.body;

            const loginUser = { 
                user_name,
                password
            };

            const {query, filteredValues: values} = searchQuery("SysUser", {user_name});
            const response = await db_pool.query(query, values);

            // Checks if user exists
            if (response.rows.length === 0) {
                return res.status(401).json({ error: 'Username is invalid.' });
            }

            // Checks if password is correct
            const hashed_password = response.rows[0].hashed_password;
            const salt = response.rows[0].password_salt;
            if (hashed_password === crypto.createHash('sha256').update(loginUser.password + salt).digest('hex')) {
                res.status(200).json({
                    user_token: generateUserToken(response.rows[0].user_id),
                    role_id: response.rows[0].role_id
                });
            } else {
                res.status(401).json({ error: 'Password is invalid' });
            }
        } catch (err) {
            console.error(err.message);
            res.status(500).json(err.message);
        }
    }
);

router.get('/users/security_questions',
    body('user_name').isString().withMessage('Username must be a string').notEmpty().withMessage('Username is required'),
    async(req, res) => {
        // Responds with validation error messages
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }
        // Attempts to get security questions
        try {
            // Assign query parameters to local variables
            const { 
                user_name,
            } = req.query;

            const recoveryUser = { 
                user_name,
            };

            const response = await db_pool.query(
                `SELECT sq.question, 
                    sq.answer 
                FROM SysUser su
                JOIN SecurityQuestion sq ON su.user_id = sq.user_id
                WHERE su.user_name = $1`, [user_name]);

            // Checks if user exists
            if (response.rows.length === 0) {
                return res.status(409).json();
            } else {
                return res.status(200).json(response.rows);
            }

        } catch (err) {
            console.error(err.message);
            res.status(500).json(err.message);
        }
    }
);


module.exports = router;