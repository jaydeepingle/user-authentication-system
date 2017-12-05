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
  
  app.post('/register', registerHandler(app));
  app.get('/register', registerHandler(app));
  
  app.get('/account', accountHandler(app));
}

function logoutHandler(app) {
    return function(req, res) {
        res.redirect('login');
    };
}

function accountHandler(app) {
    //console.log("ACCOUNT HANDLER");
    return function(req, res) {
        var c = req.cookies;
        console.log("COOKIES: ", c);
        if(c['email'] === 'undefined' || c['authToken'] === 'undefined') {
            var errors = {};
            errors['qSubmitError'] = 'Invalid username or password!';
            res.send(doMustache(app, 'login', errors));          
            //res.redirect('/login');
        } else {
            var errors = {};
            app.users.getUser(c).then(function (json) {
                if(json.response && json.response.status === 401) {
                    //errors['email'] = c['email'];
                    //errors['qSubmitError'] = 'Invalid Username or Password!';
                    res.send(doMustache(app, 'login', errors));          
                } else {
                    res.send(doMustache(app, 'account', json));
                }
            }); // if no get user then login page
        }
    };
}

function rootRedirectHandler(app) {
    return function(req, res) {
        res.redirect('login');
    };
}

function deleteAllCookies(cookies) {
    var cookies = cookies.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        cookies = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

function clearCookies() {
    res.clearCookie('email', {path: '/'});
    res.clearCookie('authToken', {path: '/'});
}

function loginHandler(app) {
    return function(req, res) {
        const isDisplay = (typeof req.body.submit === 'undefined');
        if(req.body.submit === 'logout') {
            console.log("COOKIES");
            
            const p = clearCookies(res);
            p.then(function (value) {
                resres.redirect('/login');
            });
            // deleteAllCookies(req.cookies);

            
            //res.send(doMustache(app, 'login', {}));          
        } else {
            if (isDisplay) { //simply render search page
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
}

// console log would help, use them to debug and develop
function registerHandler(app) {
    //console.log("REGISTER USER");
    return function(req, res) {
        const isDisplay = (typeof req.body.submit === 'undefined');
        if (isDisplay) { 
            // console.log("isDisplay");
            res.send(doMustache(app, 'register', {}));
        } else {
            // console.log("ELSE");
            const q = req.body;
            var errors = {};
            var flag = 0;
            //validations for each
            if (typeof q.firstname === 'undefined' || q['firstname'].trim().length === 0) {
                // console.log("FIRSTNAME 1");
                flag = 1;
                errors['qFirstNameError'] = 'Please provide a value';
            } else if(!(/^[a-zA-Z ]+$/.test(q.firstname))) {
                // console.log("FIRSTNAME 2");
                flag = 1;
                errors['qFirstNameError'] ='Please provide a valid value';
            } else {
                errors['firstname'] = q.firstname;
            }

            if (typeof q.lastname === 'undefined' || q['lastname'].trim().length === 0) {
                // console.log("LASTNAME 1");
                flag = 1;
                errors['qLastNameError'] = 'Please provide a value';
            } else if(!(/^[a-zA-Z ]+$/.test(q.lastname))) {
                // console.log("LASTNAME 2");
                flag = 1;
                errors['qLastNameError'] = 'Please provide a valid value';
            } else {
                errors['lastname'] = q.lastname;
            }

            if (typeof q.email === 'undefined' || q['email'].trim().length === 0) {
                // console.log("EMAIL 1");
                flag = 1;
                errors['qEmailError']= 'Please provide a value';
            } else if(!(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(q.email))) {
                // console.log("EMAIL 2");
                flag = 1;
                errors['qEmailError']= 'Please provide a valid value';
            } else {
                errors['email'] = q.email;
            }

            if (typeof q.password === 'undefined' || q['password'].trim().length === 0) {
                // console.log("PASSWORD 1");
                flag = 1;
                errors['qPasswordError'] = 'Please provide a value';
            } else if(!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/.test(q.password))) {
                // console.log("PASSWORD 2");
                flag = 1;
                errors['qPasswordError'] = 'Please provide a strong value';
            }

            if (typeof q.confirmPassword === 'undefined' || q['confirmPassword'].trim().length === 0) {
                // console.log("CONFIRM PASSWORD 1");
                flag = 1;
                errors['qConfirmPasswordError'] = 'Please provide a value';
            } else if(q.password !== q.confirmPassword) {
                // console.log("CONFIRM PASSWORD 2");
                flag = 1;
                errors['qConfirmPasswordError'] = 'Password Mismatch';
            }
            
            if(flag !== 1) {
                // console.log("FLAG SUCCESS");
                app.users.registerUser(q).then(function(json) {
                    //console.log("User Created", json);

                    if(json.response && json.response.status === 303) {
                        //append error somewhere
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