<!DOCTYPE html>
<html>
   <head>
      <title>Account</title>
      <link rel="stylesheet" href="/css/style.css">
   </head>
   <body>
      <h1>Account</h1>
      <p class="error">{{msg}}</p>
      <form method="POST" action="/register">
         <div>
            <label>
            <span class="label">Email</span>
            <input name="email" class="control" value="{{email}}"><br>
            {{#qEmailError}}<span class="error">{{qEmailError}}<br></span>{{/qEmailError}}
            </label>
         </div>
         <div>
            <label>
            <span class="label">Firstname</span>
            <input name="firstname" class="control" value="{{firstname}}"><br>
            {{#qFirstNameError}}<span class="error">{{qFirstNameError}}<br></span>{{/qFirstNameError}}
            </label>
         </div>
         <div>
            <label>
            <span class="label">Lastname</span>
            <input name="lastname" class="control" value="{{lastname}}"><br>
            {{#qLastNameError}}<span class="error">{{qLastNameError}}<br></span>{{/qLastNameError}}
            </label>
         </div>
         <div>
            <label>
            <span class="label">Password</span>
            <input name="password" class="control" type="password"  value="{{password}}"><br>
            {{#qPasswordError}}<span class="error">{{qPasswordError}}<br></span>{{/qPasswordError}}
            </label>
         </div>
         <div>
            <label>
            <span class="label">Confirm Password</span>
            <input name="confirmPassword" class="control" type="password" value="{{confirmPassword}}"><br>
            {{#qConfirmPasswordError}}<span class="error">{{qConfirmPasswordError}}<br></span>{{/qConfirmPasswordError}}
            </label>
         </div>
         <a href="/login">Login<a>
         <input name="submit" type="submit" value="register" class="control">
         {{#qSubmitError}}<span class="error">{{qSubmitError}}<br></span>{{/qSubmitError}}
      </form>
      {{>footer}}
   </body>
</html>