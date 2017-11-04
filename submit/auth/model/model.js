const users = require('./users');
const tokens = require('./tokens');


function Model(user_db, token_db) {
    this.users = new users.Users(user_db);
    this.tokens = new tokens.Tokens(token_db);
}

module.exports = {
    Model: Model
};