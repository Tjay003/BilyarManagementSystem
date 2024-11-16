<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Login - Better Billiards</title>
    <!-- Bootstrap CDN -->
    <link
      href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="LoginStyles.css?v=<?php echo time(); ?>" />


  </head>
  <body>
    <div class="top container">
        <a href="customerDisplay.html" class="btn btn-secondary mt-4">Go Back</a>
    </div>
    <div class="main">
      <div class="login-container mt-5">
        <h2 class="text-center">Login</h2>
        <form>
          <div class="form-group">
            <label for="username" class="text-dark">Username</label>
            <input
              type="text"
              class="form-control"
              id="username"
              placeholder="Enter your username"
              required
            />
          </div>
          <div class="form-group">
            <label for="password" class="text-dark">Password</label>
            <input
              type="password"
              class="form-control"
              id="password"
              placeholder="Enter your password"
              required
            />
          </div class="loginBtn">
          <button type="submit" class="btn btn-primary btn-block">Login</button>
          <div class="text-center mt-3">
            <a href="/Bilyar4/BilyarSystem/2dashboard/dashboard.php">Forgot Password?</a>
          </div>
        </form>
      </div>
    </div>

    <!-- Bootstrap JS and Popper.js -->
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.0.7/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
  </body>
</html>
