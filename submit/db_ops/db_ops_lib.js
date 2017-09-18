'use strict';

const assert = require('assert');
const mongo = require('mongodb').MongoClient;


//used to build a mapper function for the update op.  Returns a
//function F = arg => body.  Subsequently, the invocation,
//F.call(null, value) can be used to map value to its updated value.
function newMapper(arg, body) {
    return new(Function.prototype.bind.call(Function, Function, arg, body));
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
    var obj = JSON.parse(op);
    // Switch case to deal with the type of operation
    switch (obj.op) {
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
    mongo.connect(url).then(function(db, err) {
        if(err) {
    		error("Unable to connect to DB");
    	}
	    obj.args.forEach(function(record) {
            db.collection(obj.collection).insertOne(record);
        });
        db.close();
    });
}

function readRecord(mongo, url, obj) {
    mongo.connect(url).then(function(db, error) {
    	if(error) {
    		error("Unable to connect to DB");
    	}
        db.collection(obj.collection).find(obj.args).forEach(function(record) {
            console.log(record);
        });
        db.close();
    });
}

function updateRecord(mongo, url, obj) {
	var mapper = newMapper(obj.fn[0], obj.fn[1]);
	mongo.connect(url).then(function(db, error) {
		if(error) {
    		error("Unable to connect to DB");
    	}
        db.collection(obj.collection).find(obj.args).forEach(function(record) {
	        var mapped = mapper.call(null, record);
	        try {
	        	db.collection(obj.collection).update(record, mapped).then(function(result, error) {
	    			if(result === undefined) {
	    				console.error(error);
	    			}
	    			db.close();
	    		});
	        } catch (e) {
	            print(e);
	        }
	    });
	});
}

function deleteRecord(mongo, url, obj) {
    mongo.connect(url).then(function(db, error) {
    	if(error) {
    		error("Unable to connect to DB");
    	}
        if (obj.args === "undefined") {
            db.collection(obj.collection).deleteMany({});
        } else {
            try {
                db.collection(obj.collection).deleteMany(obj.args);
            } catch (e) {
                print(e);
            }
        }
        db.close();
    });
}

//make main dbOp() function available externally
module.exports.dbOp = dbOp;
module.exports.createRecord = createRecord;
module.exports.readRecord = readRecord;
module.exports.updateRecord = updateRecord;
module.exports.deleteRecord = deleteRecord;