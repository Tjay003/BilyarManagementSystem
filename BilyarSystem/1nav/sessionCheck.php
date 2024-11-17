<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: /Bilyar4/BilyarSystem/7Login/2LoginPage.php");
    exit();
}

// Function to check role access
function checkRole($allowedRoles) {
    if (!in_array($_SESSION['role'], $allowedRoles)) {
        // Store the attempted URL in session for logging purposes (optional)
        $_SESSION['attempted_access'] = $_SERVER['REQUEST_URI'];
        
        // Redirect to access denied page
        header("Location: /Bilyar4/BilyarSystem/1nav/accessDenied.php");
        exit();
    }
}