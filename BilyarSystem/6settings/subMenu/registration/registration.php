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
</head>
<style>
    
.btn-primary {
    background-color: var(--color2);
    /* Custom primary color */
    color: var(--color4);
    /* Text color */
    border: none;
    /* No border */
    border-radius: 10px;

    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    transition: 300ms all ease;
}
    /* Rounded corners */

.btn-primary:hover {
    background-color: var(--color3);
    color: white;
    box-shadow: 0px 5px 5px 0px #54473F;
    /* Darker shade on hover */
}

.btn-primary:focus {
    background-color: #9A7E6F;/* Color on click */
    outline: none; /* Removes the focus outline */
}

 .btn-primary:active {
    background-color: var(--color3) !important;
    color: white !important;
    box-shadow: 0px 5px 5px 0px #54473F !important;
}
</style>

<body>
    <?php include '../../../1nav/aside.php'; ?>

    <main>
        <div class="container registration">
            <h1 class="text-center mb-4">Employee Registration</h1>

            <form id="registrationForm" autocomplete="off">
                <div class="row g-3">
                    <div class="col-sm-6">
                        <label for="firstName" class="form-label">First Name</label>
                        <input type="text" name="firstName" class="form-control" id="firstName" placeholder="Enter your first name" required>
                    </div>
                    <div class="col-sm-6">
                        <label for="lastName" class="form-label">Last Name</label>
                        <input type="text" name="lastName" class="form-control" id="lastName" placeholder="Enter your last name" required>
                    </div>
                    <div class="col-sm-6">
                        <label for="contactNumber" class="form-label" min="11" max="11">Contact Number</label>
                        <input type="tel" name="contactNumber" class="form-control" id="contactNumber" placeholder="Enter your contact number" required>
                    </div>
                    <div class="col-sm-6">
                        <label for="username" class="form-label">Username</label>
                        <input type="text" name="username" class="form-control" id="username" placeholder="Choose a username" required>
                    </div>
                    <div class="col-sm-12">
                        <label for="email" class="form-label">Email Address</label>
                        <input type="email" name="email" class="form-control" id="email" placeholder="Enter your email" required>
                    </div>
                    <div class="col-sm-6">
                        <label for="password" class="form-label">Password</label>
                        <input type="password" name="password" class="form-control" id="password" placeholder="Create a password" required>
                    </div>
                    <div class="col-sm-6">
                        <label for="confirmPassword" class="form-label">Confirm Password</label>
                        <input type="password" name="confirmPassword" class="form-control" id="confirmPassword" placeholder="Confirm your password" required>
                    </div>
                    <div class="col-sm-6">
                        <label for="role" class="form-label">Role</label>
                        <select class="form-select" id="role" name="role" required>
                            <option value="" disabled selected>Select a role</option>
                            <option value="manager">Manager</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div class="col-sm-6">
                        <label for="profileImage" class="form-label">Profile Image</label>
                        <input type="file" class="form-control" name="image" id="profileImage" accept="image/*">
                    </div>
                </div>
                <button type="submit" class="btn btn-primary mt-3">Register</button>
            </form>
        </div>
    </main>

    <!-- Bootstrap JS and Popper.js -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js"></script>
    <script src="../../../1nav/frontEnd.js"></script>
    <script src="1registration.js"></script>
    

</body>

</html>
