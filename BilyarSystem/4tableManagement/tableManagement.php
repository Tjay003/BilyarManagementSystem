<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Table Management - Better Billiards</title>
  <!-- Google Material Icons -->
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

  <!-- Bootstrap 5 CSS CDN -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet" />

  <!-- FontAwesome for icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />

  <!-- Custom Stylesheet -->
  <link rel="stylesheet" href="../systemStyles/styles.css?v=<?php echo time(); ?>" />
  <link rel="stylesheet" href="tmStyles.css?v=<?php echo time(); ?>">

</head>

<body>
  <!-- Include sidebar and navigation -->
  <?php include '../1nav/aside.php'; ?>

  <main>
    <div class="tableManagement">
      <div><h2 class="text-center">Table Management</h2></div>
      <div class="timerContent row clearfix" id="tableCards">
        <!-- Cards will be populated using JavaScript -->
      </div>
    </div>

    <div class="modal fade" id="timerModal" tabindex="-1" aria-labelledby="timerModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 600px;"> <!-- Adjust max-width -->
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title tableNumber mx-3" id="timerModalLabel"></h5> <!-- Empty for dynamic content -->
            <span class="badge bg-secondary status"></span> <!-- Empty for dynamic content -->
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Tabs -->
            <ul class="nav nav-tabs" id="myTab" role="tablist">
              <li class="nav-item" role="presentation">
                <a class="nav-link active" id="timer-tab" data-bs-toggle="tab" href="#timer" role="tab"
                  aria-controls="timer" aria-selected="true">Timer Settings</a>
              </li>
              <li class="nav-item" role="presentation">
                <a class="nav-link" id="billing-tab" data-bs-toggle="tab" href="#billing" role="tab"
                  aria-controls="billing" aria-selected="false">Billing Logs</a>
              </li>
            </ul>
            <div class="tab-content mt-3" id="myTabContent">
              <!-- Timer Settings Tab -->
              <div class="tab-pane fade show active" id="timer" role="tabpanel" aria-labelledby="timer-tab">
                <h6>Choose Timer Type:</h6>
                <div class="form-check">
                  <input type="radio" class="form-check-input" name="timerType" id="regularTime" value="regular"
                    checked>
                  <label class="form-check-label" for="regularTime">Regular Time</label>
                </div>
                <div class="form-check">
                  <input type="radio" class="form-check-input" name="timerType" id="openTime" value="open">
                  <label class="form-check-label" for="openTime">Open Time</label>
                </div>

                <div id="regularTimeFields" class="mt-3">
                  <div class="btn-group mb-3" role="group" aria-label="Quick Actions">
                    <button type="button" class="btn btn-outline-primary" onclick="setQuickTime(30)">30 Min</button>
                    <button type="button" class="btn btn-outline-primary" onclick="setQuickTime(60)">1 Hr</button>
                    <button type="button" class="btn btn-outline-primary" onclick="setQuickTime(120)">2 Hr</button>
                  </div>
                  <div class="row mb-2">
                    <div class="col">
                      <input type="number" id="hoursInput" class="form-control" placeholder="Hours" aria-label="Hours">
                    </div>
                    <div class="col">
                      <input type="number" id="minutesInput" class="form-control" placeholder="Minutes"
                        aria-label="Minutes">
                    </div>
                    <!-- Add Time Button -->
                    <div class="col-auto">
                      <button type="button" class="btn btn-success" id="addTimeButton">Add Time</button>
                    </div>
                  </div>
                  <div class="row text-center">
                    <div class="col">
                      <p class="mb-0">Remaining Time</p>
                      <span data-type="remainingTimeRegular">00:00:00</span>
                    </div>
                  </div>
                </div>

                <div id="openTimeFields" class="mt-1 text-center" style="display:none;">
                  <p class="mb-0">Running Time</p>
                  <span data-type="runningTimeOpen">00:00:00</span>
                </div>

                <div class="mt-1">
                  <h6>Time Used:</h6>
                  <p>Start Time: <span id="startTime">N/A</span></p>
                  <p>End Time: <span id="endTime">N/A</span></p>
                  <p>Total Time Used: <span id="timeUsed">0 min</span></p>
                </div>
              </div>

              <!-- Billing Logs Tab -->
              <div class="tab-pane fade" id="billing" role="tabpanel" aria-labelledby="billing-tab">
                <div>
                  <h6>Billing Logs</h6>
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Price</th>
                        <th>Paid</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody id="billingLogsBody">
                      <!-- Billing logs rows will be added here dynamically -->
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="4" class="text-right">
                          <strong>Total Unpaid: <span data-type="totalBillDisplay">0</span></strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div class="mb-3">
                  <label for="noteInput">Customer Notes:</label>
                  <textarea id="noteInput" class="form-control" rows="3"
                    placeholder="Enter your notes here..."></textarea>
                </div>
              </div>

            </div>
          </div>
          <div class="modal-footer">
            <button id="startTimer" class="btn btn-success" disabled>Start Timer</button>
            <button id="pauseTimer" class="btn btn-warning" disabled>Pause Timer</button>
            <button id="resumeTimer" class="btn btn-info" disabled>Resume Timer</button>
            <button id="stopTimer" class="btn btn-danger" disabled>Stop Timer</button>
            <button id="saveTimer" class="btn btn-success" disabled>Save Timer</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editModalLabel">Edit Price</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="editLogId" />
            <div class="mb-3">
              <label for="editPriceInput" class="form-label">Price</label>
              <input type="text" class="form-control" id="editPriceInput" placeholder="Enter new price" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" id="saveChangesBtn">Save changes</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="deleteModalLabel">Confirm Deletion</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete this log?</p>
                <input type="hidden" id="confirmDeleteLogId" />
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Delete</button>
            </div>
        </div>
    </div>
</div>




  </main>

  <!-- Bootstrap JS and Popper.js (for modals and other interactive components) -->
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>

  <!-- Custom JS files -->
  <script src="1tm.js"></script>
  <script src="../1nav/frontEnd.js"></script>
</body>

</html>