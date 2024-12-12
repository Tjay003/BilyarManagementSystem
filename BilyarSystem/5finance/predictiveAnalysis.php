<?php
require_once '../1nav/sessionCheck.php';
// Only admin and manager can access
checkRole(['admin', 'manager']);
?>


<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Financial Management - Better Billiards</title>

  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />

  <!-- Custom Styles -->
  <link rel="stylesheet" href="../systemStyles/styles.css?v=<?php echo time(); ?>" />
  <link rel="stylesheet" href="financeStyles.css?v=<?php echo time(); ?>" />
</head>

<body>
  <?php include '../1nav/aside.php'; ?>

  <main>
    <div class="text-center">
      <h1>Predictive Analytics</h1>
    </div>

    <div class="container mt-4">
        <!-- Revenue Prediction Section -->
        <div class="card mb-4">
            <div class="card-header">
                <h3>Revenue Prediction</h3>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <label for="revenuePredictionDate" class="form-label">Select Date for Prediction</label>
                        <input type="date" class="form-control" id="revenuePredictionDate">
                    </div>
                    <div class="col-md-6 d-flex align-items-end">
                        <button class="btn btn-primary" onclick="predictRevenue()">Predict Revenue</button>
                    </div>
                </div>
                <div class="mt-3">
                    <h4>Prediction Results:</h4>
                    <div id="revenuePredictionResult" class="alert alert-info">
                        Select a date and click predict to see revenue forecast.
                    </div>
                </div>
            </div>
        </div>

        <!-- Survivability Analysis Section -->
        <div class="card">
            <div class="card-header">
                <h3>Business Survivability Analysis</h3>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <label for="survivabilityDate" class="form-label">Select Analysis Date</label>
                        <input type="date" class="form-control" id="survivabilityDate">
                    </div>
                    <div class="col-md-6 d-flex align-items-end">
                        <button class="btn btn-primary" onclick="analyzeSurvivability()">Analyze Survivability</button>
                    </div>
                </div>
                <div class="mt-3">
                    <h4>Analysis Results:</h4>
                    <div id="survivabilityResult" class="alert alert-info">
                        Select a date and click analyze to see business health forecast.
                    </div>
                </div>
            </div>
        </div>
    </div>
  </main>

  <!-- Chart.js 4.4.6 -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <!-- Bootstrap 5.3.0 JS Bundle (includes Popper) -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <!-- Custom JS -->
  <script src="../1nav/frontEnd.js"></script>
  <script src="1ApredictiveAnalysis.js"></script>

  <!-- Add this before your other scripts -->
  <script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.15.0"></script>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-vis@1.5.1"></script>
</body>

</html>