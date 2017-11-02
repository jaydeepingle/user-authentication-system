const express = require('express');
const bodyParser = require('body-parser');

const https = require('https');
const fs = require('fs');

const KEY_PATH = "/home/jaydeep/http-server/key.pem";
const CERT_PATH = "/home/jaydeep/http-server/cert.pem";

const OK = 200;
const CREATED = 201;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const SERVER_ERROR = 500;
const SEE_OTHER = 303;
const NO_CONTENT = 204;

function serve(model, port) {
    const app = express();
    app.locals.model = model;
    app.locals.port = port;
    setupRoutes(app);

    https.createServer({
      key: fs.readFileSync(KEY_PATH),
      cert: fs.readFileSync(CERT_PATH),
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

function loginUser(app) {
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

function registerUser(app) {
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

function getUsers(app) {
    console.log("I am in getUsers");
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