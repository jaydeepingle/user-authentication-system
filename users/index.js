#!/usr/bin/env nodejs

const express = require("express");
const app = express();
const assert = require('assert');
const mongo = require('mongodb').MongoClient;
const process = require('process');
const bodyParser = require("body-parser");

const users = require('./model/users');
const model = require('./model/model');
const server = require('./server/server');


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

const DB_URL = 'mongodb://localhost:27017/users';

function getPort(argv) {
    console.log("1: ", argv[0], "\n2: ", argv[1], "\n3: ", argv[2]);
    let port = null;
    if (argv.length !== 3 || !(port = Number(argv[2]))) {
        console.error(`usage: ${argv[1]} PORT`);
        process.exit(1);
    }
    return port;
}

const port = getPort(process.argv);

//console.log("Connecting to Mongo DB");
mongo.connect(DB_URL).
then((db) => users.initUsers(db)).
then(function(db) {
    const model1 = new model.Model(db);
    server.serve(port, model1);
    //db.close();
}).
catch((e) => console.error(e));