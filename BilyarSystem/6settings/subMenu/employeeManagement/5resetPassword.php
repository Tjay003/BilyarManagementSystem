<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Connect to the database
include '../../../0database/db_connect.php';

// Get the JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['id']) && isset($data['password'])) {
    $id = intval($data['id']);
    $newPassword = password_hash($data['password'], PASSWORD_DEFAULT); // Hash the new password

    // Prepare and execute the update query
    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->bind_param("si", $newPassword, $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid ID or password']);
}

$conn->close();
?>
