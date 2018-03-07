#!/usr/bin/env nodejs

'use strict';

const express = require("express");
const app = express();
const assert = require('assert');
const mongo = require('mongodb').MongoClient;
const process = require('process');
const bodyParser = require("body-parser");

const https = require('https');
const fs = require('fs');

const options = require('./options');
const users = require('./model/users');
const tokens = require('./model/tokens');
const model = require('./model/model');
const server = require('./server/server');

const USR_DB_URL = 'mongodb://localhost:27017/users';
const args = options

mongo.connect(USR_DB_URL).
then(function(db) {
    const model1 = new model.Model(db, args.options.authTimeout);
    server.serve(model1, args.options.port, args.options.sslDir + "/key.pem", args.options.sslDir + "/cert.pem", args.options.authTimeout);    
}).
catch((e) => console.error(e));