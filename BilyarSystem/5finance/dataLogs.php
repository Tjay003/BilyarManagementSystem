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
    
    <main class="datalogs">
        <div class="text-center">
            <h1>Data Logs</h1>
            <div class="row">
              <div class="col-3">
              <input type="text" id="searchInput" class="form-control" placeholder="Search by Table Number or Session ID">
              </div>
              <div class="col-2">
              <input type="date" id="dateFilter" class="form-control">
              </div>
              <div class="col-2">
              <select id="monthFilter" class="form-control">
        <option value="">Select Month</option>
        <option value="0">January</option>
        <option value="1">February</option>
        <option value="2">March</option>
        <option value="3">April</option>
        <option value="4">May</option>
        <option value="5">June</option>
        <option value="6">July</option>
        <option value="7">August</option>
        <option value="8">September</option>
        <option value="9">October</option>
        <option value="10">November</option>
        <option value="11">December</option>
    </select>
              </div>
              <div class="col-2">
              <select id="yearFilter" class="form-control">
        <option value="">Select Year</option>
        <!-- You can dynamically generate these options based on your data -->
        <option value="2024">2024</option>
        <!-- Add more years as needed -->
    </select>
              </div>
              <div class="col-3">
              <button id="exportToExcel" class="btn btn-success mb-3 float-end">
                <i class="fas fa-file-excel"></i> Export to Excel
            </button>
              </div>
            </div>
           
        </div>
        <table class="table table-striped table-bordered">
            <thead>
                <tr>
                    <th>Session Id</th>
                    <th>Table Number</th>
                    <th>
                        Start Time
                        <button onclick="sortTable('startTime')" id="startTimeSortBtn"
                            class="btn btn-warning">Sort</button>
                    </th>
                    <th>
                        Saved Time
                        <button onclick="sortTable('savedTime')" id="savedTimeSortBtn"
                            class="btn btn-warning">Sort</button>
                    </th>
                    <th>
                        Total Bill
                        <button onclick="sortTable('totalBillAmount')" id="totalBillSortBtn"
                            class="btn btn-warning">Sort</button>
                    </th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody id="tableInfoBody">
                <!-- Rows will be populated here by JavaScript -->
            </tbody>
        </table>
        <div class="paginationContainer d-flex justify-content-center my-4">
            <nav aria-label="Page navigation">
                <ul class="pagination" id="pagination">
                    <li class="page-item"><a class="page-link" href="#" id="prev">Previous</a></li>
                    <!-- Page numbers will be dynamically added here -->
                    <li class="page-item"><a class="page-link" href="#" id="next">Next</a></li>
                </ul>
            </nav>
        </div>
    </main>

    <div class="modal fade" id="userModal" tabindex="-1" aria-labelledby="userModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="userModalLabel">Logs Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        
      </div>
      <div class="modal-body">
        <form>
          <div class="mb-3">
            <input type="hidden" id="tableId">
            <label for="tableNumber" class="form-label">Table Number</label>
            <input type="number" class="form-control" id="tableNumber" placeholder="tableNumber" disabled>
          </div>
          <div class="mb-3">
            <label for="totalDurationSeconds" class="form-label">Total Duration Seconds</label>
            <input type="number" class="form-control" id="totalDurationSeconds" placeholder="Total Duration Seconds" disabled>
          </div>
          
          <div class="mb-3">
            <label for="totalBillAmount" class="form-label">Total Bill Amount</label>
            <input type="number" class="form-control" id="totalBillAmount" placeholder="Total Bill Amount" disabled>
          </div>
          <div class="mb-3">
            <label for="totalBillPaid" class="form-label">Total Bill Paid</label>
            <input type="number" class="form-control" id="totalBillPaid" placeholder="(123) 456-7890">
          </div>
          <div class="mb-3">
            <label for="totalBillUnpaid" class="form-label">Total Bill Unpaid</label>
            <input type="number" class="form-control" id="totalBillUnpaid" placeholder="Total Bill Unpaid">
          </div>
          <div class="mb-3">
            <label for="timerType" class="form-label">Timer Type</label>
            <input type="text" class="form-control" id="timerType" placeholder="Timer Type" disabled>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn update btn-primary" id="updateButton">Update</button>
        <button type="button" class="btn delete btn-danger" id="deleteButton">Delete</button>
      </div>
    </div>
  </div>
  </div>

    <!-- Chart.js 4.4.6 -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- Bootstrap 5.3.0 JS Bundle (includes Popper) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <!-- Custom JS -->
    <script src="../1nav/frontEnd.js"></script>
    <script src="3dataLogs.js"></script>

    <!-- Export Preview Modal -->
    <div class="modal fade" id="exportPreviewModal" tabindex="-1" aria-labelledby="exportPreviewModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exportPreviewModalLabel">Export Preview</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="table-responsive">
              <table class="table table-striped table-bordered">
                <thead id="previewHeader"></thead>
                <tbody id="previewBody"></tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-success" id="confirmExport">
              <i class="fas fa-file-excel"></i> Confirm Export
            </button>
          </div>
        </div>
      </div>
    </div>
</body>

</html>