const Pool = require("pg").Pool;

const db_pool = new Pool({
    // Set these fields to match PostgreSQL account config
    user: "postgres",
    password: "2501",
    host: "localhost",
    port: 5432,
    database: "project_manager"
});

module.exports = db_pool;