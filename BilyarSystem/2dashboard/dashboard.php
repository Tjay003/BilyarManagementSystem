<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dashboard - Better Billiards</title>
  <!-- Bootstrap CDN for styles -->
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
  <link rel="stylesheet" href="../systemStyles/styles.css?v=<?php echo time(); ?>" />
</head>

<body>
  <?php include '../1nav/aside.php'; ?>
  <main>
    <div class="row">
      <div class="col-md-4 col-sm-12 mb-3">
        <div class="stat-item text-center">
          <h3>Total Table Occupied</h3>
          <p>12</p>
        </div>
      </div>
      <div class="col-md-4 col-sm-12 mb-3">
        <div class="stat-item text-center">
          <h3>Total Table Available</h3>
          <p>8</p>
        </div>
      </div>
      <div class="col-md-4 col-sm-12 mb-3">
        <div class="stat-item text-center">
          <h3>Total Tables</h3>
          <p>20</p>
        </div>
      </div>
    </div>
    <!-- Queue Table Section -->
    <section class="queue-section">
      <h2>Table Queue</h2>
      <table class="table queue-table">
        <thead>
          <tr>
            <th>Queue No.</th>
            <th>Customer Name</th>
            <th>Waiting Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <!-- Table rows go here -->
        </tbody>
      </table>
    </section>

    <!-- Table Management Section -->
    <section class="table-management-section">
      <h2>Table Management</h2>
      <table class="table table-management-table">
        <thead>
          <tr>
            <th>Table No.</th>
            <th>Occupied By</th>
            <th>Start Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <!-- Table rows go here -->
        </tbody>
      </table>
    </section>
  </main>

  <!-- Bootstrap JS and Popper.js -->
  <script src="../1nav/frontEnd.js"></script>
  <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.0.7/dist/umd/popper.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
</body>

</html>