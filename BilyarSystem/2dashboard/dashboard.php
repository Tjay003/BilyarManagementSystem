<?php
require_once '../1nav/sessionCheck.php';

?>

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
  <div class="row g-3">
  <div class="col-lg-4 col-md-6">
    <div class="stat-item text-center p-3 border rounded">
      <h3>Total Table Occupied</h3>
      <p id="totalOccupied">Loading...</p> <!-- Display fetched value here -->
    </div>
  </div>
  <div class="col-lg-4 col-md-6">
    <div class="stat-item text-center p-3 border rounded">
      <h3>Total Table Available</h3>
      <p id="totalAvailable">Loading...</p> <!-- Display fetched value here -->
    </div>
  </div>
  <div class="col-lg-4 col-md-6">
    <div class="stat-item text-center p-3 border rounded">
      <h3>Total Tables</h3>
      <p id="totalTables">Loading...</p> <!-- Display fetched value here -->
    </div>
  </div>
</div>

    <!-- Queue Table Section -->
    <section class="queue queue-section mt-5">
      <h2>Table Queue</h2>
       <!-- Responsive Table -->
       <table class="table table-bordered table-responsive-sm">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Time <button class="btn btn-link p-0" id="sortTime"><i class="fas"></i></button></th>                    
                    </tr>
                </thead>
                <tbody id="tableBodyReservation">
                    
                </tbody>
            </table>

            <!-- Pagination -->
            <div class="d-flex justify-content-center my-4">
                <nav aria-label="Page navigation">
                    <ul class="pagination" id="pagination">
                        <li class="page-item"><a class="page-link" href="#" id="prev">Previous</a></li>
                        <!-- Page numbers will be dynamically added here -->
                        <li class="page-item"><a class="page-link" href="#" id="next">Next</a></li>
                    </ul>
                </nav>
            </div>
    </section>

  </main>

  <!-- Bootstrap JS and Popper.js for Bootstrap 5.3.0 -->
  <script src="../1nav/frontEnd.js"></script>
  <script src="1dashboard.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

</body>

</html>
