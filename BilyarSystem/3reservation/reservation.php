<?php
require_once '../1nav/sessionCheck.php';

?>

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
    <link rel="stylesheet" href="reservationStyles.css?v=<?php echo time(); ?>">
</head>

<body>
    <?php include '../1nav/aside.php'; ?>

    <main>
        <div class="queue my-4">
            <h2 class="text-center">Queue Management</h2>

            <!-- Create button -->
            <div class="text-right mb-3">
                <button class="btn btn-primary" data-toggle="modal" data-target="#createModal">Create New Entry</button>
            </div>

            <!-- Responsive Table -->
            <table class="table table-bordered table-responsive-sm">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Time <button class="btn btn-link p-0" id="sortTime"><i class="fas"></i></button></th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="tableBodyReservation">
                    <!-- Data rows will be inserted here dynamically -->
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

            <!-- Modal for Create -->
            <div class="modal fade" id="createModal" tabindex="-1" aria-labelledby="createModalLabel"
                aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="createModalLabel">Create Entry</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form id="createForm">
                                <div class="form-group">
                                    <label for="name">Name</label>
                                    <input type="text" class="form-control" id="name" name="name" required>
                                </div>
                                <div class="form-group">
                                    <label for="order_number">Order Number</label>
                                    <input type="number" class="form-control" id="order_number" name="order_number"
                                        required>
                                </div>
                                <button type="submit" class="btn btn-primary">Save</button>
                            </form>

                        </div>
                    </div>
                </div>
            </div>

            <!-- Delete Confirmation Modal -->
            <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel"
                aria-hidden="true">
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
                            <button type="button" class="btn btn-danger" id="confirmDelete">Delete</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal for Edit -->
            <div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="editModalLabel">Edit Entry</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form id="editForm">
                                <div class="form-group">
                                    <label for="editName">Name</label>
                                    <input type="text" class="form-control" id="editName" placeholder="Enter name">
                                </div>
                                <div class="form-group">
                                    <label for="editOrderNumber">Order Number</label>
                                    <input type="number" class="form-control" id="editOrderNumber"
                                        placeholder="Enter order number">
                                </div>
                                <input type="hidden" id="editId"> <!-- Hidden field to store the ID -->
                                <button type="submit" class="btn btn-primary">Save Changes</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    </main>

    <script src="/Bilyar4/BilyarSystem/1nav/frontEnd.js"></script>
    <script src="/Bilyar4/BilyarSystem/3reservation/reservationJs.js"></script>
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.0.7/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
</body>

</html>