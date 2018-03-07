const express = require('express');
const bodyParser = require('body-parser');

const https = require('https');
const fs = require('fs');
var md5 = require('md5');
 
const authorization = require('auth-header');

const OK = 200;
const CREATED = 201;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const SERVER_ERROR = 500;
const SEE_OTHER = 303;
const NO_CONTENT = 204;
const UNAUTHORIZED = 401;
var localAuthTimeout;

function serve(model, port, keyPath, certPath, authTimeout) {
    localAuthTimeout = authTimeout;
    const app = express();
    app.locals.model = model;
    app.locals.port = port;
    setupRoutes(app);

    https.createServer({
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }, app).listen(port, function () {
        console.log("Listening on port: ", port);    
    });
}

function setupRoutes(app) {
    app.use(bodyParser.json());

    app.put('/users/:id', registerUser(app));
    app.put('/users/:id/auth', loginUser(app));
    app.get('/users/:id', getUsers(app));
}

function requestUrl(req) {
    const port = req.app.locals.port;
    return `${req.protocol}://${req.hostname}:${port}${req.originalUrl}`;
}

module.exports = {
    serve: serve
}

function getUsers(app) {
    return function(request, response) {
        const id = request.params.id;
        var authToken = "";
        var scheme = "";
        var flag = 0;
        if(request.headers && request.headers.authorization) {
            var parseHeader = authorization.parse(request.headers.authorization);
            authToken = parseHeader.token;
            scheme = parseHeader.scheme;
        } else {
            flag = 1;
        }
        if (typeof id === 'undefined') {
            response.sendStatus(BAD_REQUEST);
        } else {
            request.app.locals.model.tokens.find(id).
            then(function(results) {
                if(results.length === 0) {
                     var returnObject = { 
                        "status": "ERROR_NOT_FOUND",
                        "info": "users " + request.params.id + " not found"
                    }
                    response.status(UNAUTHORIZED).send(returnObject);
                } else {
                    if(authToken in results[0]['tokens']) {
                        if(flag === 1) {
                            var returnObject = { 
                                "status": "ERROR_UNAUTHORIZED",
                                "info": "/users/" + request.params.id + " requires a bearer authorization header"
                            }
                            response.append('Location', requestUrl(request) + '/' + id);
                            response.status(UNAUTHORIZED).send(returnObject);
                        }
                        if(new Date(results[0]['tokens'][authToken]) >= new Date()) {
                            request.app.locals.model.users.find(id).
                            then(function(records) {
                                response.json(records[0]["body"]);           
                            }).
                            catch((err) => {
                                console.error(err);
                                response.sendStatus(SERVER_ERROR);
                            });
                        } else {
                            var returnObject = { 
                                "status": "ERROR_UNAUTHORIZED",
                                "info": "/users/" + request.params.id + " requires a bearer authorization header"
                            }
                            response.append('Location', requestUrl(request) + '/' + id);
                            response.status(UNAUTHORIZED).send(returnObject);
                        }
                    } else {
                        var returnObject = { 
                            "status": "ERROR_UNAUTHORIZED",
                            "info": "/users/" + request.params.id + " requires a bearer authorization header"
                        }
                        response.append('Location', requestUrl(request) + '/' + id);
                        response.status(UNAUTHORIZED).send(returnObject);
                    }
                }
            }).
            catch((err) => {
                console.error(err);
                response.sendStatus(SERVER_ERROR);
            });
        }
    };
}

function loginUser(app) {
    return function(request, response) {
        id = request.params.id;
        if(!('pw' in request.body)) {
            // done 3
            var returnObject = { 
                "status": "ERROR_UNAUTHORIZED",
                "info": "/users/" + id + "/auth requires a valid 'pw' password query parameter"
            }
            response.append('Location', requestUrl(request) + '/' + id);
            response.status(UNAUTHORIZED).send(returnObject);
        } else {
            request.app.locals.model.users.find(String(id)).
            then(function(results) {
                if (results.length === 0) {
                    // done 5
                    var returnObject = { 
                        "status": "ERROR_NOT_FOUND",
                        "info": "user " + id + " not found"
                    }
                    response.append('Location', requestUrl(request) + '/' + id);
                    response.status(NOT_FOUND).send(returnObject);
                } else {
                    var tok = request.app.locals.model.utilities.getToken().trim(" ");
                    request.app.locals.model.tokens.find(id).
                    then(function(records) {
                        // done 4
                        if (results[0]["pw"] === md5(request.body["pw"])) {
                            var temp = {};
                            temp["id"] = id;
                            temp["tokens"] = records[0]['tokens'];
                            var time = new Date();
                            time.setSeconds(time.getSeconds() + localAuthTimeout);
                            temp["tokens"][tok] = String(time);
                            // change
                            request.app.locals.model.tokens.updateRecord(temp).
                            then(function () {
                                var returnObject = { 
                                    "status": "OK",
                                    "info": tok
                                };
                                response.append('Location', requestUrl(request) + '/' + id);
                                response.status(OK).send(returnObject);
                            }).
                            catch((err) => {
                                console.error(err);
                                response.sendStatus(SERVER_ERROR);
                            });
                        } else {
                            // done 3
                            var returnObject = { 
                                "status": "ERROR_UNAUTHORIZED",
                                "info": "/users/" + id + "/auth requires a valid 'pw' password query parameter"
                            }
                            response.append('Location', requestUrl(request) + '/' + id);
                            response.status(UNAUTHORIZED).send(returnObject);
                        }
                    }).
                    catch((err) => {
                        console.error(err);
                        response.sendStatus(SERVER_ERROR);
                    });
                }
            }).
            catch((err) => {
                console.error(err);
                response.sendStatus(SERVER_ERROR);
            });
        }
    };
}

function registerUser(app) {
    return function(request, response) {
        id = request.params.id;
        const password = request.query.pw;
        request.app.locals.model.users.find(id).
        then(function(results) {
            if (results.length === 0) {
                // done 2
                var temp = {};
                temp["id"] = id;
                request.app.locals.model.users.createRecord({"id": id, "pw": md5(password), "body": request.body}).
                then(function(id) {
                    var tok = request.app.locals.model.utilities.getToken().trim(" ");
                    temp["tokens"] = {};
                    var time = new Date();
                    time.setSeconds(time.getSeconds() + localAuthTimeout);
                    temp["tokens"][tok] = String(time);
                    request.app.locals.model.tokens.createRecord(temp).
                    then(function () {
                        var returnObject = { 
                            "status": "CREATED",
                            "info": tok
                        };
                        response.append('Location', requestUrl(request) + '/' + id);
                        response.status(CREATED).send(returnObject);
                    }).
                    catch((err) => {
                        console.error(err);
                        response.sendStatus(SERVER_ERROR);
                    });
                }).
                catch((err) => {
                    console.error(err);
                    response.sendStatus(SERVER_ERROR);
                });
            } else {
                // done 1
                var returnObject = { 
                    "status": "EXISTS",
                    "info": "user " + id + " already exists"
                }
                response.append('Location', requestUrl(request) + '/' + id);
                response.status(SEE_OTHER).send(returnObject);
            }
        }).
        catch((err) => {
            console.error(err);
            response.sendStatus(SERVER_ERROR);
        });
    };
}
