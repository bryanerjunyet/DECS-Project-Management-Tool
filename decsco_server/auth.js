const jwt = require('jsonwebtoken');
const key = "saltedpotato";

const generateUserToken = (user_id) => {
    // Sign the token
    const token = jwt.sign(
        {user_id}, 
        key, 
        {expiresIn: '10h'}
    );
    return token;
}

const compareUserTokens = (token_1, token_2) => {
    let decode_1, decode_2;
    try {
        decode_1 = jwt.verify(token_1, key);
    } catch (err) {
        console.log("Failed to verify token 1.", err.message);
        return null;
    }
    try {
        decode_2 = jwt.verify(token_2, key);
    } catch (err) {
        console.log("Failed to verify token 2.", err.message);
        return null;
    }

    return decode_1.user_id === decode_2.user_id;
}

const decodeUserToken = (user_token) => {
    try {
        const data = jwt.verify(user_token, key);
        return data;
    } catch (err) {
        console.log("Failed to verify token.", err.message);
        return null;
    }
}

module.exports = {
    generateUserToken,
    decodeUserToken,
    compareUserTokens
};