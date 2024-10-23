<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Table Settings - Better Billiards</title>
  <!-- Bootstrap CDN for styles -->
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
  <link rel="stylesheet" href="../../../systemStyles/styles.css?v=<?php echo time(); ?>" />
  <link rel="stylesheet" href="tableSettingsStyles.css?v=<?php echo time(); ?>">
</head>

<body>
  <?php include '../../../1nav/aside.php'; ?>

  <main>
    <div class="container tableSettings my-4">
      <h2 class="text-center">Table Settings</h2>

      <!-- Input for number of tables -->
      <div class="d-flex justify-content-start mb-4 mt-4 align-items-center">
        <!-- Label for the input field -->
        <label for="tableCount" class="mr-2">Enter the Total Number of Tables:</label>
        <input type="number" class="form-control w-25" id="tableCount" placeholder="Enter number of tables" min="0"
          aria-label="Number of tables">
        <button class="btn btn-primary mx-2" id="setTablesBtn">Set Tables</button>
        <button class="btn btn-secondary" id="decrementBtn">-</button>
        <button class="btn btn-secondary mx-2" id="incrementBtn">+</button>
      </div>


      <!-- Input for number of tables -->
      <div class="d-flex justify-content-start mb-4 mt-4 align-items-center">
        <!-- Label for the input field -->
        <label for="specifiedTable" class="mr-2">Enter the Number of Tables to Add or Remove:</label>
        <input type="number" class="form-control w-25" id="specifiedTable" placeholder="Number of tables" min="0"
          aria-label="Number of tables">
        <button class="btn btn-secondary mx-2" id="add">Add</button>
        <button class="btn btn-secondary" id="delete">Delete</button>
      </div>


      <!-- Increment and Decrement Buttons -->
      <div class="d-flex justify-content-start ">
        <p id="numberOfTables">Total Number of Tables: </p>
      </div>

      <!-- Generated Tables Information -->
      <table class="table table-striped table-bordered">
        <thead>
          <tr>
            <th>Table Number <button class="btn btn-sm btn-light" id="sortTableBtn">Sort</button></th>
            <th>Action</th>
          </tr>
        </thead>
        <!-- tableInfoBody Variable -->
        <tbody id="tableInfoBody">
          <!-- Table rows will be generated here -->
        </tbody>
      </table>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteModalLabel">Delete Confirmation</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            Are you sure you want to delete this entry?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Table Modal -->
    <div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editModalLabel">Edit Table</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="editTableId">
            <div class="mb-3">
              <label for="editTableName" class="form-label">Table Number</label>
              <input type="text" class="form-control" id="editTableNumber" required>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="saveEditBtn">Save Changes</button>
          </div>
        </div>
      </div>
    </div>


  </main>

  <!-- Bootstrap JS and Popper.js -->
  <script src="../../../1nav/frontEnd.js"></script>
  <script src="1tableSettings.js"></script>
  <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.0.7/dist/umd/popper.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
</body>

</html>