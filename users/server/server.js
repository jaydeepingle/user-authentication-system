const express = require('express');
const bodyParser = require('body-parser');


const OK = 200;
const CREATED = 201;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const SERVER_ERROR = 500;

function serve(port, model) {
    const app = express();
    app.locals.model = model;
    app.locals.port = port;
    setupRoutes(app);
    app.listen(port, function() {
        console.log(`listening on port ${port}`);
    });
}

function setupRoutes(app) {
    app.use(bodyParser.json());
    app.get('/users/:id', getUsers(app));
    app.delete('/users/:id', deleteUser(app));
    app.put('/users/:id', updateUser(app));
    app.post('/users/:id', createUser(app));
}

function requestUrl(req) {
    const port = req.app.locals.port;
    return `${req.protocol}://${req.hostname}:${port}${req.originalUrl}`;
}

module.exports = {
    serve: serve
}

function updateUser(app) {
    //request.params.id gives you ID
    console.log("updateUser");
    return function(request, response) {
        console.log("REQUEST : ", typeof request.body);
        request.body.id = request.params.id;
        id = request.params.id;


        console.log("updateUser else : ", id);
        request.app.locals.model.users.find(id).
        then(function(results) {
            if (results.length === 0) {

                console.log("Array Length 0");
                console.log("REQUEST NESTED : ", request.body);
                request.app.locals.model.users.createRecord(request.body).
                then(function(id) {
                    console.log("updateUser []");
                    response.append('Location', requestUrl(request) + '/' + id);
                    response.sendStatus(CREATED);
                }).
                catch((err) => {
                    console.error(err);
                    response.sendStatus(SERVER_ERROR);
                });
            } else {
                console.log("updateUser ELSE");
                request.app.locals.model.users.updateRecord(request.body).
                then(function(id) {
                    console.log("updateUser Something");
                    response.append('Location', requestUrl(request) + '/' + id);
                    response.sendStatus(CREATED);
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

/*function updateUser(app) {
  //request.params.id gives you ID
  console.log("updateUser");
  return function(request, response) {
    console.log("REQUEST ID : ", request.params.id);
    request.body.id = request.params.id;
    request.app.locals.model.users.createRecord(request.body).
      then(function(id) {
        console.log("updateUser then");
  response.append('Location', requestUrl(request) + '/' + id);
  response.sendStatus(CREATED);
      }).
      catch((err) => {
  console.error(err);
  response.sendStatus(SERVER_ERROR);
      });
  };
}*/

function createUser(app) {
    //request.params.id gives you ID
    //console.log("createUser");
    return function(request, response) {
        //console.log("REQUEST ID : ", request.params.id);
        request.body.id = request.params.id;
        request.app.locals.model.users.createRecord(request.body).
        then(function(id) {
            //console.log("createUser then");
            response.append('Location', requestUrl(request) + '/' + id);
            response.sendStatus(CREATED);
        }).
        catch((err) => {
            console.error(err);
            response.sendStatus(SERVER_ERROR);
        });
    };
}

function getUsers(app) {
    //request.params.id gives you ID
    console.log("getUsers");
    return function(request, response) {
        //const q = request.query.q;
       const id = request.params.id;
        if (typeof id === 'undefined') {
            response.sendStatus(BAD_REQUEST);
        } else {
            //console.log("getUsers else : ", id);
            request.app.locals.model.users.find(id).
            then((results) => response.json(results)).
            catch((err) => {
                console.error(err);
                response.sendStatus(SERVER_ERROR);
            });
        }
    };
}

function deleteUser(app) {
    //request.params.id gives you ID
    //console.log("deleteUser");
    return function(request, response) {
        const id = request.params.id;
        if (typeof id === 'undefined') {
            response.sendStatus(BAD_REQUEST);
        } else {
            //console.log("deleteUser else : ", id);
            request.app.locals.model.users.remove(id).
            then(() => response.end()).
            catch((err) => {
                console.error(err);
                response.sendStatus(NOT_FOUND);
            });
        }
    };
}
