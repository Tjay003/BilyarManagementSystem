<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dashboard - Better Billiards</title>
  <!-- Bootstrap 5.3.0 CDN for styles -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
  <link rel="stylesheet" href="../systemStyles/styles.css?v=<?php echo time(); ?>" />
  <link rel="stylesheet" href="dashboardStyles.css?v=<?php echo time(); ?>" />
</head>

<body>
  <?php include '../1nav/aside.php'; ?>
  <main class="dashboard mt-4">
    <div class="container">
      <h1>Dashboard Overview</h1>
      
      <!-- Sample cards -->
      <div class="row mt-4">
        <div class="col-md-4 mb-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Total Sales</h5>
              <p class="card-text">$10,000</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-4 mb-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">New Orders</h5>
              <p class="card-text">25</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-4 mb-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Active Users</h5>
              <p class="card-text">150</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Sample table -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Recent Transactions</h5>
              <table class="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>John Doe</td>
                    <td>$100</td>
                    <td>Completed</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Jane Smith</td>
                    <td>$75</td>
                    <td>Pending</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Recent Transactions</h5>
              <table class="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>John Doe</td>
                    <td>$100</td>
                    <td>Completed</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Jane Smith</td>
                    <td>$75</td>
                    <td>Pending</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Recent Transactions</h5>
              <table class="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>John Doe</td>
                    <td>$100</td>
                    <td>Completed</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Jane Smith</td>
                    <td>$75</td>
                    <td>Pending</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </main>

  <!-- Bootstrap JS and Popper.js for Bootstrap 5.3.0 -->
  <script src="../1nav/frontEnd.js"></script>
  <script src="1dashboard.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

</body>

</html>
