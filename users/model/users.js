const assert = require('assert');

const USERS = 'users';
const DEFAULT_USERS = './records';
const DEFAULT_INDEXES = { title: 'text', authors: 'text' };

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


Users.prototype.find = function(query) {
  const searchSpec = { $text: { $search: query } };
  console.log("products find ", searchSpec, "\n"); 
  return this.users.find(searchSpec).toArray();
}


Users.prototype.remove = function(id) {
  const searchSpec = { $text: { $search: id } };
  console.log("products delete ", searchSpec, "\n"); 
  return this.users.deleteMany({"id": parseInt(id)});
}

function initUsers(db, users=null) {
  return new Promise(function(resolve, reject) {
    if (users === null) {
      users = require(DEFAULT_USERS);
    }
    const collection = db.collection(USERS);
    collection.deleteMany({}, function(err, result) {
      if (err !== null) reject(err);
      collection.createIndex(DEFAULT_INDEXES);
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
