<?php
// Database credentials
$servername = "localhost";  // Usually "localhost" if the database is hosted on the same server
$username = "root";  // Replace with your database username
$password = "";  // Replace with your database password
$dbname = "bilyar4";  // Replace with your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
