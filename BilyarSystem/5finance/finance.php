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
      <h1>Data Analytics</h1>
    </div>

    <div class="row">
      <div class="col-12 col-md-8 col-lg-8 col-xl-6">
        <label for="aggregationSelect" class="form-label">Total Revenue Over Time</label>
        <select class="form-control w-auto" id="aggregationSelect" onchange="initializeChartForTotalRevenue()">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <canvas id="revenueChart" class="w-100"></canvas>
      </div>
      <div class="col-12 col-md-8 col-lg-8 col-xl-6">
        <label for="TableRevSelect" class="form-label">Revenue by Table</label>
        <select class="form-control w-auto" id="TableRevSelect" onchange="initializeChartForRevenuePertable()">
          <option value="highest">Highest</option>
          <option value="lowest">Lowest</option>
        </select>
        <canvas id="tableRevenueChart" class="w-100"></canvas> 
      </div>
    </div>

    <div class="row">
      <div class="col-12 col-md-8 col-lg-6 col-xl-6">
        <label for="TimerTypeRevChartType" class="form-label">Revenue by Timer Type</label>
        <select class="form-control w-auto" id="TimerTypeRevChartType" onchange="initializeChartForRevenueByTimerType()">
        <option value="bar">Bar Chart</option>
          <option value="pie">Pie Chart</option>
        </select>
        <canvas id="TimerTypeRevenueChart" class="w-100"></canvas>
      </div>
      <div class="col-12 col-md-8 col-lg-8 col-xl-6">
        <label for="UnpaidBillsAggregated" class="form-label">Unpaid Bills Analysis</label>
        <select class="form-control w-auto" id="UnpaidBillsAggregated" onchange="initializeChartForUnpaidBills()">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <canvas id="UnpaidBillsAnalysisChart" class="w-100"></canvas>
      </div>
    </div>

    <div class="utilizationRate row">
      <div class="col-12 col-md-8 col-lg-6 col-xl-6">
        <label for="typeForUtilizationRate" class="form-label">Utilization Rates</label>
        <select class="form-control w-auto" id="typeForUtilizationRate" onchange="initializeChartForUtilizationRates()">
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
        </select>
        <canvas id="UtilizationRateChart" class="w-100"></canvas>
      </div>
    </div>
    <div class="paddingBottom"></div>

  </main>

  <!-- Chart.js 4.4.6 -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <!-- Bootstrap 5.3.0 JS Bundle (includes Popper) -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <!-- Custom JS -->
  <script src="../1nav/frontEnd.js"></script>
  <script src="1finance.js"></script>
</body>

</html>