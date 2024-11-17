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
    <!-- Add Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
  </head>
  <body>
    <!-- <div class="top container">
        <a href="customerDisplay.html" class="btn btn-secondary mt-4">Go Back</a>
    </div> -->
    <div class="main">
      <div class="login-container mt-5">
        <div class="logo-container">
            <!-- Add your logo image here -->
            <img src="../../images/logo/3wTextTransparent.png" alt="Better Billiards Logo">
        </div>
        <h4 class="text-center">Welcome Back</h4>
        <form action="3LoginProcess.php" method="POST">
          <?php if (isset($_GET['error'])) { ?>
            <div class="alert alert-danger" role="alert">
              <?php echo htmlspecialchars($_GET['error']); ?>
            </div>
          <?php } ?>
          <div class="form-group">
            <label for="username" class="text-dark">Username</label>
            <i class="fas fa-user"></i>
            <input
              type="text"
              class="form-control"
              id="username"
              name="username"
              placeholder="Enter your username"
              required
            />
          </div>
          <div class="form-group">
            <label for="password" class="text-dark">Password</label>
            <i class="fas fa-lock"></i>
            <input
              type="password"
              class="form-control"
              id="password"
              name="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" class="btn btn-primary btn-block">Sign In</button>
          
        </form>
      </div>
    </div>

    <!-- Bootstrap JS and Popper.js -->
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.0.7/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
  </body>
</html>
