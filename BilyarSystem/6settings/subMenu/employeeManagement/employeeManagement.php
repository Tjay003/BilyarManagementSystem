<?php
require_once '../../../1nav/sessionCheck.php';
// Only admin and manager can access
checkRole(['admin', 'manager']);
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Registration - Better Billiards</title>
  <!-- Bootstrap CDN for styles -->
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
  <link rel="stylesheet" href="../../../systemStyles/styles.css?v=<?php echo time(); ?>" />
  <link rel="stylesheet" href="emStyles.css?v=<?php echo time(); ?>" />
</head>

<body>
  <?php include '../../../1nav/aside.php'; ?>

  <main>
    <div class="employeeManagement">
      <h1 class="text-center mb-4">Employee Management</h1>

    <table class="table table-striped table-bordered">
    <thead>
      <tr>
        <th>First Name</th>
        <th>Last Name</th>
        <th>Role</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody id="tableInfoBody">
      <!-- Sample Row (Repeat for each user) -->
      <tr>
        <td>John</td>
        <td>Doe</td>
        <td>Manager</td>
        <td>
          <button type="button" class="btn btn-info btn-sm" data-bs-toggle="modal" data-bs-target="#userModal">
            <i class="fas fa-eye"></i> View / Edit
          </button>
        </td>
      </tr>
      <!-- End Sample Row -->
    </tbody>
  </table>
    </div>
  </main>

  <div class="modal fade" id="userModal" tabindex="-1" aria-labelledby="userModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="userModalLabel">User Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form>
        <div class="text-center mb-3">
          <div>
          <img id="userImagePreview" src="" alt="User Image" class="img-fluid rounded mb-3" style="width: 150px; height: 150px; object-fit: cover;">
          </div>
          <div>
          <button type="button" id="changeImageButton" class="btn btn-secondary btn-sm mt-2">Change Image</button>
          <input type="file" id="imageUpload" class="form-control d-none" id="userImage">
          </div>
        </div>

          <div class="mb-3">
            <input type="hidden" id="userId">
            <label for="firstName" class="form-label">First Name</label>
            <input type="text" class="form-control" id="firstName" placeholder="John">
          </div>
          <div class="mb-3">
            <label for="lastName" class="form-label">Last Name</label>
            <input type="text" class="form-control" id="lastName" placeholder="Doe">
          </div>
          
          <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input type="text" class="form-control" id="username" placeholder="johndoe">
          </div>
          <div class="mb-3">
            <label for="contactNumber" class="form-label">Contact Number</label>
            <input type="text" class="form-control" id="contactNumber" placeholder="(123) 456-7890">
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email" placeholder="john.doe@example.com">
          </div>
          <div class="mb-3">
            <label for="role" class="form-label">Role</label>
            <select class="form-control" id="role">
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div class="mb-3">
          <button type="button" class="btn reset-password btn-dark" id="resetPassword">Reset Password</button>
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



  <!-- Bootstrap JS and Popper.js -->
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js"></script>
  <script src="../../../1nav/frontEnd.js"></script>
  <script src="eManage.js"></script>
</body>

</html>