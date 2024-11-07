<?php
// Include error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Connect to the database
include '../../../0database/db_connect.php';

// Get JSON input from the AJAX request
$data = json_decode(file_get_contents("php://input"), true);

// Check if data is set
if (isset($data['id']) && isset($data['first_name']) && isset($data['last_name']) && isset($data['username']) && isset($data['contact_number']) && isset($data['email']) && isset($data['role'])) {
    
    // Sanitize inputs
    $id = intval($data['id']);
    $first_name = $conn->real_escape_string($data['first_name']);
    $last_name = $conn->real_escape_string($data['last_name']);
    $username = $conn->real_escape_string($data['username']);
    $contact_number = $conn->real_escape_string($data['contact_number']);
    $email = $conn->real_escape_string($data['email']);
    $role = $conn->real_escape_string($data['role']);
    
    // Check if the username is already taken by a different user
    $usernameCheck = $conn->query("SELECT id FROM users WHERE username = '$username' AND id != $id");
    if ($usernameCheck->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Username is already taken"]);
        exit;
    }
    
    // Check if the email is already taken by a different user
    $emailCheck = $conn->query("SELECT id FROM users WHERE email = '$email' AND id != $id");
    if ($emailCheck->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Email is already taken"]);
        exit;
    }
    
    // SQL query to update the user in the database
    $sql = "UPDATE users SET first_name = '$first_name', last_name = '$last_name', username = '$username', contact_number = '$contact_number', email = '$email', role = '$role' WHERE id = $id";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Invalid input"]);
}

$conn->close();
?>
