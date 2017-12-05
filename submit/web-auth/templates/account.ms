<!DOCTYPE html>
<html>
   <head>
      <title>Account</title>
      <link rel="stylesheet" href="/css/style.css">
   </head>
   <body>
      <h1>Account</h1>
      <p class="error">{{msg}}</p>
      <form method="GET" action="/login">
         <label>
         <span class="label">Hello {{firstname}} {{lastname}}</span>
         </label>
         <input name="submit" type="submit" value="logout" class="control">
      </form>
      {{>footer}}
   </body>
</html>