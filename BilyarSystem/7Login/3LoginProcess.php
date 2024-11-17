<?php
session_start();
require_once '../0database/db_connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST['username']);
    $password = $_POST['password'];
    
    if (empty($username) || empty($password)) {
        header("Location: 2LoginPage.php?error=Please fill in all fields");
        exit();
    }
    
    // Using your existing database connection ($conn)
    $stmt = $conn->prepare("SELECT id, username, password, role, first_name, last_name FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    if ($user && password_verify($password, $user['password'])) {
        // Login successful
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['full_name'] = $user['first_name'] . ' ' . $user['last_name'];
        
        // Redirect to dashboard
        header("Location: ../2dashboard/dashboard.php");
        exit();
    } else {
        // Invalid credentials
        header("Location: 2LoginPage.php?error=Invalid username or password");
        exit();
    }
}