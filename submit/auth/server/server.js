const express = require('express');
const bodyParser = require('body-parser');

const https = require('https');
const fs = require('fs');

const authorization = require('auth-header');

const OK = 200;
const CREATED = 201;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const SERVER_ERROR = 500;
const SEE_OTHER = 303;
const NO_CONTENT = 204;

function serve(model, port, keyPath, certPath) {
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
    console.log("I am in getUsers");
    return function(request, response) {
        const id = request.params.id;
        //console.log("\n\nrequest\n\n", request.headers.authorization.split(' ')[1]);
        console.log("\n\nrequest\n\n", authorization.parse(request.headers.authorization).token);
        if (typeof id === 'undefined') {
            response.sendStatus(BAD_REQUEST);
        } else {
            request.app.locals.model.users.find(id).
            then(function(results) {
              if(results.length === 0) {
                response.sendStatus(NOT_FOUND);
              } else {
                response.json(results[0]["body"]);
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
    console.log("I am in loginUser");
    return function(request, response) {
        id = request.params.id;
        console.log("id: ", id, "\nbody:\n", request.body);

        if(!('pw' in request.body)) {
            var returnObject = { 
                "status": "ERROR_UNAUTHORIZED",
                "info": "/users/" + id + "/auth requires a valid 'pw' password query parameter"
            }
            response.append('Location', requestUrl(request) + '/' + id);
            response.status(NOT_FOUND).send(returnObject);
        } else {
            request.app.locals.model.users.find(id).
            then(function(results) {
                if (results.length === 0) {
                    // return 404 NOT_FOUND
                    //// Location Header
                    // return a body
                    /*
                        { 
                            "status": "ERROR_NOT_FOUND",
                            "info": "user <ID> not found"
                        }   
                    */
                    request.app.locals.model.users.createRecord({"id": id, "body": request.body}).
                    then(function(id) {
                        response.append('Location', requestUrl(request) + '/' + id);
                        response.sendStatus(CREATED);
                    }).
                    catch((err) => {
                        console.error(err);
                        response.sendStatus(SERVER_ERROR);
                    });
                    // else part
                    var returnObject = { 
                        "status": "ERROR_NOT_FOUND",
                        "info": "user " + id + " not found"
                    }
                    response.append('Location', requestUrl(request) + '/' + id);
                    response.status(NOT_FOUND).send(returnObject);
                } else {
                    // return 200 OK
                    // return a body
                    /*
                        { 
                            "status": "OK",
                            "info": "auth-token"
                        }   
                    */
                    var pwd = "";
                    if(pwd) {
                        var returnObject = { 
                            "status": "OK",
                            "info": "auth-token"
                        }   
                        response.append('Location', requestUrl(request) + '/' + id);
                        response.status(OK).send(returnObject);
                    } else {
                        var returnObject = { 
                            "status": "ERROR_UNAUTHORIZED",
                            "info": "/users/" + id + "/auth requires a valid 'pw' password query parameter"
                        }
                        response.append('Location', requestUrl(request) + '/' + id);
                        response.status(NOT_FOUND).send(returnObject);
                    }
                    /*request.app.locals.model.users.updateRecord({"id": id, "body": request.body}).
                    then(function(id) {
                        response.append('Location', requestUrl(request) + '/' + id);
                        response.sendStatus(NO_CONTENT);
                    }).
                    catch((err) => {
                        console.error(err);
                        response.sendStatus(SERVER_ERROR);
                    });*/
                    // try to return something else to decide the user did not enter the correct password
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
    console.log("I am in registerUser");
    return function(request, response) {
        id = request.params.id;
        const password = request.query.pw;
        console.log("id: ", id, "\tpassword: ", password, "\nbody:\n", request.body);
        request.app.locals.model.users.find(id).
        then(function(results) {
            if (results.length === 0) {
                // create
                // return 201 created
                // Location Header
                // return a body
                request.app.locals.model.users.createRecord({"id": id, "body": request.body}).
                then(function(id) {
                    var returnObject = { 
                        "status": "CREATED",
                        "info": "results.token"
                    };
                    response.append('Location', requestUrl(request) + '/' + id);
                    response.status(CREATED).send(returnObject);
                }).
                catch((err) => {
                    console.error(err);
                    response.sendStatus(SERVER_ERROR);
                });
            } else {
                // return 303 SEE_OTHER
                // Location Header
                // return a body
                /*
                    { 
                        "status": "EXISTS",
                        "info": "user <ID> already exists"
                    }
                */
                //request.app.locals.model.users.updateRecord({"id": id, "body": request.body}).
                
                var returnObject = { 
                    "status": "EXISTS",
                    "info": "user " + id + " already exists"
                }
                response.append('Location', requestUrl(request) + '/' + id);
                response.status(SEE_OTHER).send(returnObject);

                /*then(function(id) {
                    var returnObject = { 
                        "status": "EXISTS",
                        "info": "user " + id + " already exists"
                    }
                    response.append('Location', requestUrl(request) + '/' + id);
                    response.status(SEE_OTHER).send(returnObject);
                }).
                catch((err) => {
                    console.error(err);
                    response.sendStatus(SERVER_ERROR);
                });*/
            }
        }).
        catch((err) => {
            console.error(err);
            response.sendStatus(SERVER_ERROR);
        });

    };
}

function updateUser(app) {
    return function(request, response) {
        id = request.params.id;
        request.app.locals.model.users.find(id).
        then(function(results) {
            if (results.length === 0) {
                request.app.locals.model.users.createRecord({"id": id, "body": request.body}).
                then(function(id) {
                    response.append('Location', requestUrl(request) + '/' + id);
                    response.sendStatus(CREATED);
                }).
                catch((err) => {
                    console.error(err);
                    response.sendStatus(SERVER_ERROR);
                });
            } else {
                request.app.locals.model.users.updateRecord({"id": id, "body": request.body}).
                then(function(id) {
                    response.append('Location', requestUrl(request) + '/' + id);
                    response.sendStatus(NO_CONTENT);
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

    };
}

function createUser(app) {
    return function(request, response) {
        id = request.params.id;
        request.app.locals.model.users.find(id).
        then(function(results) {
            if (results.length === 0) {
                response.sendStatus(NOT_FOUND);
            } else {
                request.app.locals.model.users.updateRecord({"id": id, "body": request.body}).
                then(function(id) {
                    response.append('Location', requestUrl(request) + '/' + id);
                    response.sendStatus(SEE_OTHER);
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

    };
}

function deleteUser(app) {
    return function(request, response) {
        const id = request.params.id;
        if (typeof id === 'undefined') {
            response.sendStatus(BAD_REQUEST);
        } else {
            request.app.locals.model.users.find(id).
            then(function(results) {
              if(results.length === 0) {
                response.sendStatus(NOT_FOUND);
              } else {
                  request.app.locals.model.users.remove(id).
                  then(() => response.end()).
                  catch((err) => {
                      console.error(err);
                      response.sendStatus(NOT_FOUND);
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