<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Better Billiards</title>
  <!-- Bootstrap CDN -->
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
  <link rel="stylesheet" href="LoginStyles.css?v=<?php echo time(); ?>" />
</head>

<body>
  <div class="mainContainerCustomerDisplay container full-height">
    <!-- Heading -->
    <!-- <div class="mt-4 d-flex justify-content-end">
      <a href="LogIn.html" class="btn btn-secondary">Dashboard</a>
    </div> -->
    <div class="text-center mt-4">
      <img src="../images/logo/3wTextTransparent.png" alt="Better Billiards Logo" class="logo-img"/>
      <h5 class="address-text mb-5">
        <a href="https://www.google.com/maps/place/Better+Billiards+Intramuros/@14.5924844,120.9778853,19.19z/data=!4m15!1m8!3m7!1s0x3397ca3d1375e1fb:0x49ebfa658c0ba08!2sIntramuros,+Maynila,+1002+Kalakhang+Maynila!3b1!8m2!3d14.5895972!4d120.9747258!16zL20vMDNiNWps!3m5!1s0x3397cb367a232a43:0x6dfb616080623d18!8m2!3d14.5925209!4d120.977875!16s%2Fg%2F11vc5pnb41?entry=ttu&g_ep=EgoyMDI0MTExMy4xIKXMDSoASAFQAw%3D%3D" target="_blank">478 San Juan de Letran, Intramuros, Manila</a>
      </h5>
    </div>

    <!-- row -->
    <div class="row h-100 d-flex justify-content-center text-center">
      <!-- Column 1: Table Status -->
      <div class="col-md-5 mb-5 d-flex flex-column table-status-column">
        <h3>Table Status</h3>
        <div class="dropdown mb-3">
      <select class="form-select" id="sortSelect" style="width: 200px;">
        <option value="default">Default Sort</option>
        <option value="tableNumber">Sort by Table Number</option>
        <option value="openTime">Sort by Open Time</option>
        <option value="endingSoon">Sort by Ending Soon</option>
        <option value="status">Sort by Status</option>
      </select>
    </div>
        <div class="scrolling-wrapper px-2" id="tableCards">
          <!-- Cards will be dynamically added here -->
        </div>
      </div>

      <!-- Column 2: Customer Queueing -->
      <div class="col-md-5 d-flex flex-column justify-content-center">
        <h3>Customer Queueing</h3>
        <!-- Table for Customer Queueing -->
        <table class="table table-bordered">
          <thead class="thead">
            <tr>
              <th>Customer Number</th>
            </tr>
          </thead>
          <tbody id="tableBodyReservation">
            <!-- js na bahala -->
          </tbody>
        </table>
        <div class="d-flex justify-content-center my-4">
      <nav aria-label="Page navigation">
        <ul class="pagination" id="pagination">
          <li class="page-item"><a class="page-link" href="#" id="prev">Previous</a></li>
          <!-- Page numbers will be dynamically added here -->
          <li class="page-item"><a class="page-link" href="#" id="next">Next</a></li>
        </ul>
      </nav>
    </div>
      </div>
    
    </div>
    
  </div>



  <!-- Bootstrap JS and Popper.js -->
  <script src="3customerScript.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</body>

</html>