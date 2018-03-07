const assert = require('assert');

const TOKENS = 'tokens';

function Tokens(db) {
    this.db = db;
    this.tokens = db.collection(TOKENS);
}

Tokens.prototype.createRecord = function(data) {
    return this.tokens.insertOne(data).
    then(function(results) {
        return new Promise((resolve) => resolve(results.insertedId));
    });
}

Tokens.prototype.updateRecord = function(data) {
    const dataSpec = {
        id: data.id
    };
    return this.tokens.replaceOne(dataSpec, data).
    then(function(result) {
        return new Promise(function(resolve, reject) {
            if (result.modifiedCount != 1) {
                reject(new Error(`updated ${result.modifiedCount} tokens`));
            } else {
                resolve();
            }
        });
    });
}

Tokens.prototype.find = function(id) {
    return this.tokens.find({"id": id}).toArray();
}

Tokens.prototype.remove = function(id) {
    return this.tokens.deleteMany({
        "id": id
    });
}

module.exports = {
    Tokens: Tokens
};