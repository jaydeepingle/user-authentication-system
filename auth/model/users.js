const assert = require('assert');

const USERS = 'users';

function Users(db) {
    this.db = db;
    this.users = db.collection(USERS);
}

Users.prototype.createRecord = function(data) {
    return this.users.insertOne(data).
    then(function(results) {
        return new Promise((resolve) => resolve(results.insertedId));
    });
}

Users.prototype.updateRecord = function(data) {
    const dataSpec = {
        id: data.id
    };
    return this.users.replaceOne(dataSpec, data).
    then(function(result) {
        return new Promise(function(resolve, reject) {
            if (result.modifiedCount != 1) {
                reject(new Error(`updated ${result.modifiedCount} users`));
            } else {
                resolve();
            }
        });
    });
}

Users.prototype.find = function(id) {
    return this.users.find({"id": id}).toArray();
}

Users.prototype.remove = function(id) {
    return this.users.deleteMany({
        "id": id
    });
}

module.exports = {
    Users: Users
};