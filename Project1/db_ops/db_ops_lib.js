'use strict';

const assert = require('assert');
const mongo = require('mongodb').MongoClient;


//used to build a mapper function for the update op.  Returns a
//function F = arg => body.  Subsequently, the invocation,
//F.call(null, value) can be used to map value to its updated value.
function newMapper(arg, body) {
  return new (Function.prototype.bind.call(Function, Function, arg, body));
}

//print msg on stderr and exit.
function error(msg) {
  console.error(msg);
  process.exit(1);
}

//export error() so that it can be used externally.
module.exports.error = error;


//auxiliary functions; break up your code into small functions with
//well-defined responsibilities.

//perform op on mongo db specified by url.
function dbOp(url, op) {
  //your code goes here
  
  //db.createCollection("users");
  var obj = JSON.parse(op);
  console.log("OP: ", obj.op);
  switch(obj.op) {
  	case "create":
  		createRecord(mongo, url, obj);
  		break;
  	case "read":
  		readRecord(mongo, url, obj);
  		break;
  	case "update":
  		updateRecord(mongo, url, obj);
  		break;
  	case "delete":
  		deleteRecord(mongo, url, obj);
  }
}

function createRecord(mongo, url, obj) {
	console.log("Create URL: ", url);
	mongo.connect(url).then(function(db) {
		//db.createCollection(obj.collection).then(function(err, collection) {
		obj.args.forEach(function(record) {
			console.log("Record Inserted...!!!");
			db.collection(obj.collection).insertOne(record);
			console.log("Record: ", record);
		});
		//});
		console.log("Collection created");
		db.close();
	});
}

function readRecord(mongo, url, obj) {
	console.log("Read");
	mongo.connect(url).then(function(db) {
		console.log("Connected");
		db.collection(obj.collection).find().each(function (e, r) { console.log(r); });
		db.close();
	});
}

function updateRecord(mongo, url, obj) {
	console.log("Update");
}

function deleteRecord(mongo, url, obj) {
	console.log("Delete");
	mongo.connect(url).then(function(db) {
		//obj.args.forEach(function(record) {
		db.collection(obj.collection).deleteMany({});
		console.log("Record Deleted...!!!");
		//});
		db.close();
	});
}

//make main dbOp() function available externally
module.exports.dbOp = dbOp;
module.exports.createRecord = createRecord;
module.exports.readRecord = readRecord;
module.exports.updateRecord = updateRecord;
module.exports.deleteRecord = deleteRecord;