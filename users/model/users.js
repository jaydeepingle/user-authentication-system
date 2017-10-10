const assert = require('assert');

const USERS = 'users';
const DEFAULT_USERS = './records';

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
    //return this.users.updateOne(dataSpec, {body: data.body}).
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

function initUsers(db, users = null) {
    return new Promise(function(resolve, reject) {
        if (users === null) {
            users = require(DEFAULT_USERS);
        }
        const collection = db.collection(USERS);
        collection.deleteMany({}, function(err, result) {
            if (err !== null) reject(err);
            collection.insertMany(users, function(err, result) {
                if (err !== null) reject(err);
                if (result.insertedCount !== users.length) {
                    reject(Error(`insert count ${result.insertedCount} !== ` +
                        `${users.length}`));
                }
                resolve(db);
            });
        });
    });
}

module.exports = {
    Users: Users,
    initUsers: initUsers
};