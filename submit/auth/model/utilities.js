const assert = require('assert');

const UTILITIES = 'utilities';

function Utilities() {
    //this.db = db;
    //this.users = db.collection(USERS);
}

Utilities.prototype.getToken = function() {
    var text = " ";
    var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < 32; i++ )
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    return text;   
}

/*Users.prototype.createRecord = function(data) {
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
}*/

module.exports = {
    Utilities: Utilities
};