#!/usr/bin/env nodejs

'use strict';
//nodejs dependencies
const fs = require('fs');
const process = require('process');

//external dependencies
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mustache = require('mustache');

//local dependencies
const STATIC_DIR = 'statics';
const TEMPLATES_DIR = 'templates';
const CART_COOKIE = 'cartId';

const app = express();
const assert = require('assert');
const mongo = require('mongodb').MongoClient;

const options = require('./options');
const users = require('./model/users');

const args = options
const https = require('https');

/*************************** Route Handling ****************************/

function setupRoutes(app) {
  app.get('/', rootRedirectHandler(app));
  
  app.post('/login', loginHandler(app));
  app.get('/login', loginHandler(app));
  
  app.get('/logout', logoutHandler(app));

  app.post('/register', registerHandler(app));
  app.get('/register', registerHandler(app));
  
  app.get('/account', accountHandler(app));
}

function logoutHandler(app) {
    return function(req, res) {
        res.clearCookie('email');
        res.clearCookie('authToken');
        res.redirect('/login');
    };
}

function accountHandler(app) {
    return function(req, res) {
        var c = req.cookies;
        if(c['email'] === 'undefined' || c['authToken'] === 'undefined') {
            res.redirect('/login');
        } else {
            var errors = {};
            app.users.getUser(c).then(function (json) {
                if(json.response && json.response.status === 401) {
                    res.clearCookie('email');
                    res.clearCookie('authToken');
                    res.redirect('/login');
                } else {
                    res.send(doMustache(app, 'account', json));
                }
            });
        }
    };
}

function rootRedirectHandler(app) {
    return function(req, res) {
        res.redirect('login');
    };
}

function loginHandler(app) {
    return function(req, res) {
        const isDisplay = (typeof req.body.submit === 'undefined');
        if (isDisplay) { 
            res.send(doMustache(app, 'login', {}));
        } else {
            const q = req.body;
            var flag = 0;
            var errors = {};
            if (typeof q['email'] === 'undefined' || q['email'].trim().length === 0) {
                flag = 1;
                errors['qEmailError'] = 'Please provide a value';
            } else {
                errors['email'] = q.email;
            }
            if (typeof q['password'] === 'undefined' || q['password'].trim().length === 0) {
                flag = 1;
                errors['qPasswordError'] = 'Please provide a value';
            } 
            if(flag !== 1) {
                app.users.loginUser(q).then(function (json) {
                    //console.log("LOGIN USER VALIDATIONS SUCCEED");
                    if(json.response && json.response.status && json.response.status === 401) {
                        errors = {};
                        errors['email'] = q.email;
                        errors['qSubmitError'] = 'Invalid Username or Password';
                        res.send(doMustache(app, 'login', errors));  
                    } else {
                        res.cookie('authToken', json.authToken);
                        res.cookie('email', q.email);
                        res.redirect('/account');
                    }
                });
            } else {
                res.send(doMustache(app, 'login', errors));  
            }
        }
    }
}

// console log would help, use them to debug and develop
function registerHandler(app) {
    //console.log("REGISTER USER");
    return function(req, res) {
        const isDisplay = (typeof req.body.submit === 'undefined');
        if (isDisplay) { 
            res.send(doMustache(app, 'register', {}));
        } else {
            const q = req.body;
            var errors = {};
            var flag = 0;
            if (typeof q.firstname === 'undefined' || q['firstname'].trim().length === 0) {
                flag = 1;
                errors['qFirstNameError'] = 'Please provide a value';
            } else if(!(/^[a-zA-Z ]+$/.test(q.firstname))) {
                flag = 1;
                errors['qFirstNameError'] ='Please provide a valid value';
            } else {
                errors['firstname'] = q.firstname;
            }

            if (typeof q.lastname === 'undefined' || q['lastname'].trim().length === 0) {
                flag = 1;
                errors['qLastNameError'] = 'Please provide a value';
            } else if(!(/^[a-zA-Z ]+$/.test(q.lastname))) {
                flag = 1;
                errors['qLastNameError'] = 'Please provide a valid value';
            } else {
                errors['lastname'] = q.lastname;
            }

            if (typeof q.email === 'undefined' || q['email'].trim().length === 0) {
                flag = 1;
                errors['qEmailError']= 'Please provide a value';
            } else if(!(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(q.email))) {
                flag = 1;
                errors['qEmailError']= 'Please provide a valid value';
            } else {
                errors['email'] = q.email;
            }

            if (typeof q.password === 'undefined' || q['password'].trim().length === 0) {
                flag = 1;
                errors['qPasswordError'] = 'Please provide a value';
            } else if(!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/.test(q.password))) {
                flag = 1;
                errors['qPasswordError'] = 'Please provide a strong value';
            }

            if (typeof q.confirmPassword === 'undefined' || q['confirmPassword'].trim().length === 0) {
                flag = 1;
                errors['qConfirmPasswordError'] = 'Please provide a value';
            } else if(q.password !== q.confirmPassword) {
                flag = 1;
                errors['qConfirmPasswordError'] = 'Password Mismatch';
            }
            
            if(flag !== 1) {
                app.users.registerUser(q).then(function(json) {

                    if(json.response && json.response.status === 303) {
                        errors['qSubmitError'] = 'User already exists!';
                        res.send(doMustache(app, 'register', errors));        
                    } else {
                        res.cookie("authToken", json.authToken);
                        res.cookie("email", q.email);
                        res.redirect('/account');
                    }
                });
            } else {
                res.send(doMustache(app, 'register', errors));
            }
        }
    }
}

/************************ Utility functions ****************************/

function doMustache(app, templateId, view) {
    const templates = {
        footer: app.templates.footer
    };
    return mustache.render(app.templates[templateId], view, {});
}

function errorPage(app, errors, res) {
    if (!Array.isArray(errors)) errors = [errors];
    const html = doMustache(app, 'errors', {
        errors: errors
    });
    res.send(html);
}

/*************************** Initialization ****************************/

function setupTemplates(app) {
    app.templates = {};
    for (let fname of fs.readdirSync(TEMPLATES_DIR)) {
        const m = fname.match(/^([\w\-]+)\.ms$/);
        if (!m) continue;
        try {
            app.templates[m[1]] =
                String(fs.readFileSync(`${TEMPLATES_DIR}/${fname}`));
        } catch (e) {
            console.error(`cannot read ${fname}: ${e}`);
            process.exit(1);
        }
    }
}

function setup() {
    process.chdir(__dirname);
    const app = express();
    app.use(cookieParser());
    setupTemplates(app);

    app.users = users;
    app.users.webUrl = options.options.webUrl;
    app.use(express.static(STATIC_DIR));
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    setupRoutes(app);

    https.createServer({
        key: fs.readFileSync(options.options.sslDir + "/key.pem"),
        cert: fs.readFileSync(options.options.sslDir + "/cert.pem")
    }, app).listen(options.options.port, function () {
        console.log("Listening on port: ", options.options.port);    
    });
}

setup();