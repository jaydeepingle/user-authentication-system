#!/usr/bin/env nodejs

'use strict';

const express = require("express");
const app = express();
const assert = require('assert');
const mongo = require('mongodb').MongoClient;
const process = require('process');
const bodyParser = require("body-parser");

const options = require('./options');
const https = require('https');
const fs = require('fs');

const users = require('./model/users');
const model = require('./model/model');
const server = require('./server/server');


const DB_URL = 'mongodb://localhost:27017/users';
const args = options
console.log("Options: ", args);

const KEY_PATH = "/home/jaydeep/http-server/key.pem";
const CERT_PATH = "/home/jaydeep/http-server/cert.pem";

mongo.connect(DB_URL).
then(function(db) {
    const model1 = new model.Model(db);
    server.serve(model1, args.options.port);
    //db.close();
}).
catch((e) => console.error(e));