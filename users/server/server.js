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
  app.get('/users', getUsers(app));
  app.delete('/users/:id', deleteUser(app));
  app.put('/users/:id', createUser(app));  
  //app.post('/users/:id', updateUser(app));  
}

function requestUrl(req) {
  const port = req.app.locals.port;
  return `${req.protocol}://${req.hostname}:${port}${req.originalUrl}`;
}
  
module.exports = {
  serve: serve
}

function createUser(app) {
  console.log("createUser");
  return function(request, response) {
    console.log("REQUEST: ", request.body);
    request.app.locals.model.users.createRecord(request.body).
      then(function(id) {
        console.log("createUser then");
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
  console.log("getUsers");
  return function(request, response) {
    const q = request.query.q;
    if (typeof q === 'undefined') {
      response.sendStatus(BAD_REQUEST);
    }
    else {
      console.log("getUsers else : ", q);
      request.app.locals.model.users.find(q).
	then((results) => response.json(results)).
	catch((err) => {
	  console.error(err);
	  response.sendStatus(SERVER_ERROR);
	});
    }
  };
}

function deleteUser(app) {
  console.log("deleteUser");
  return function(request, response) {
    const id = request.params.id;
    if (typeof id === 'undefined') {
      response.sendStatus(BAD_REQUEST);
    }
    else {
      console.log("deleteUser else : ", id);
      request.app.locals.model.users.remove(id).
  then(() => response.end()).
  catch((err) => {
    console.error(err);
    response.sendStatus(NOT_FOUND);
  });
    }
  };
}
