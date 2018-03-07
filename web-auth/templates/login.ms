<!DOCTYPE html>
<html>
   <head>
      <title>Login</title>
      <link rel="stylesheet" href="/css/style.css">
   </head>
   <body>
      <h1>Login</h1>
      <p class="error">{{msg}}</p>
      <form method="POST" action="/login">
         <label>
         <span class="label">Email</span>
         <input name="email" class="control" value="{{email}}"><br>
         {{#qEmailError}}<span class="error">{{qEmailError}}<br></span>{{/qEmailError}}
         </label>
         <label>
         <span class="label">Password</span>
         <input name="password" class="control" type="password" value="{{password}}"><br>
         {{#qPasswordError}}<span class="error">{{qPasswordError}}<br></span>{{/qPasswordError}}
         </label>
         <a href="/register">Registration<a>
         <input name="submit" type="submit" value="login" class="control">
         {{#qSubmitError}}<span class="error">{{qSubmitError}}<br></span>{{/qSubmitError}}
      </form>
      {{>footer}}
   </body>
</html>