const users = require('./users');
const tokens = require('./tokens');
const utilities = require('./utilities');

function Model(db, authTimeout) {
    this.users = new users.Users(db);
    this.tokens = new tokens.Tokens(db);
    this.utilities = new utilities.Utilities();
}

module.exports = {
    Model: Model
};