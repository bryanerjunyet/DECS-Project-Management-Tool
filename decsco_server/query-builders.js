/**
 * Dynamic insert query builder
 * - Builds basic insert queries
 * 
 * @param {string} tableName - Name of table to be inserted into
 * @param {Object} fieldData - Query fields to be inserted (JSON object)
 * @returns { query, values }:
 *  query - the constructed SQL query
 *  values - the values to be used for the query
 */
const insertQuery = (tableName, fieldData) => {
    // Removes undefined fields (Use null instead if you are attempting to insert NULL values)
    const fields = Object.keys(fieldData).filter(key => fieldData[key] !== undefined);

    // Adds the values to an array for the Pool query request
    const values = fields.map(key => fieldData[key]);

    // Builds the query
    const query = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${fields.map((_, i) => `$${i + 1}`).join(', ')})`;

    return { query, values };
};

/**
 * Dynamic search query builder
 * - Builds basic select queries with optional WHERE clauses to search for equivalent values
 * 
 * @param {string} tableName - Name of table to be searched
 * @param {Object} fieldData - Query fields to be searched (JSON object), if empty, no WHERE clause will be added
 * @param {Object} selectedFields - Fields to be retrieved in search
 * @returns { query, values }:
 *  query - the constructed SQL query
 *  values - the values to be used for the query
 */
const searchQuery = (tableName, fieldData = {}, selectedFields = []) => {
    // Removes undefined fields (Use null instead if you are attempting to insert NULL values)
    const fields = Object.keys(fieldData).filter(key => fieldData[key] !== undefined);

    // Adds the values to an array for the Pool query request
    const values = fields.map(key => fieldData[key]);

    // Builds the WHERE clause
    // const whereClause = fields.length === 0 ? "" : " WHERE " + fields.map((field, index) => `${field} = $${index + 1}`).join(' AND ');
    const whereClause = fields.length === 0 ? "" : " WHERE " + fields.map((field, index) => {
        return values[index] === null 
            ? `${field} IS NULL` 
            : `${field} = $${index + 1}`;
        }).join(' AND ');
    // Checks and adds fields that need to be retrieved by the query
    const selectFieldClause = selectedFields.length === 0 ? "*" : selectedFields.join(", ");

    // Builds the query
    const query = `SELECT ${selectFieldClause} FROM ${tableName}${whereClause}`;
    
    const filteredValues = values.filter(value => value !== null);
    return { query, filteredValues };
};

/**
 * Dynamic delete query builder
 * - Builds basic delete queries with WHERE clauses to search for and delete records with same values
 * 
 * @param {string} tableName - Name of table to delete from
 * @param {Object} fieldData - Query fields to be searched (JSON object)
 * @returns { query, values }:
 *  query - the constructed SQL query
 *  values - the values to be used for the query
 */
const deleteQuery = (tableName, fieldData) => {
    // Removes undefined fields (Use null instead if you are attempting to insert NULL values)
    const fields = Object.keys(fieldData).filter(key => fieldData[key] !== undefined);

    // Adds the values to an array for the Pool query request
    let values = fields.map(key => fieldData[key]);

    // Builds the WHERE clause
    // const whereClause = " WHERE " + fields.map((field, index) => `${field} = $${index + 1}`).join(' AND ');
    const whereClause = " WHERE " + fields.map((field, index) => {
        return values[index] === null 
            ? `${field} IS NULL` 
            : `${field} = $${index + 1}`;
    }).join(' AND ');
    // Builds the query
    const query = `DELETE FROM ${tableName}${whereClause}`;
    values = values.filter(value => value !== null);
    return { query, values };
};

/**
 * Dynamic update query builder
 * - Builds basic update queries with WHERE clauses to search for and update records with same values
 * 
 * @param {string} tableName - Name of table to update
 * @param {Object} updateData - Fields to be updated (JSON object)
 * @param {Object} searchData - Query fields to be searched (JSON object)
 * @returns { query, values }:
 *  query - the constructed SQL query
 *  values - the values to be used for the query
 */
const updateQuery = (tableName, updateData, searchData) => {
    
    // Removes undefined fields (Use null instead if you are attempting to insert NULL values)
    const updateFields = Object.keys(updateData).filter(key => updateData[key] !== undefined && key !== 'task_id');
    const searchFields = Object.keys(searchData).filter(key => searchData[key] !== undefined);

    // Adds the values to an array for the Pool query request
    const updateValues = updateFields.map(key => updateData[key]);
    const searchValues = searchFields.map(key => searchData[key]);

    // Builds the SET clause
    const setClause = " SET " + updateFields.map((field, index) => `${field} = $${index + 1}`).join(', ');

    // Builds the WHERE clause
    // const whereClause = " WHERE " + searchFields.map((field, index) => `${field} = $${index + 1 + updateFields.length}`).join(' AND ');
    const whereClause = " WHERE " + searchFields.map((field, index) => {
        return searchValues[index] === null 
            ? `${field} IS NULL` 
            : `${field} = $${index + 1 + updateFields.length}`;
    }).join(' AND ');

    // Builds the query
    const query = `UPDATE ${tableName} ${setClause} ${whereClause}`;
    
    const filteredSearchValues = searchValues.filter(value => value !== null);
    const values = [...updateValues, ...filteredSearchValues];

    return {query, values}
};
module.exports = {
    insertQuery,
    searchQuery,
    deleteQuery,
    updateQuery
};