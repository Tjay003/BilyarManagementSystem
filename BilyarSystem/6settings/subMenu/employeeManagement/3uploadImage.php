<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Connect to the database
include '../../../0database/db_connect.php';

// Check if image file and user ID are provided
if (isset($_FILES['image']) && isset($_POST['user_id'])) {
    $user_id = intval($_POST['user_id']);
    $image = $_FILES['image'];

    // Validate file type and size
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($image['type'], $allowedTypes)) {
        echo json_encode(["success" => false, "error" => "Invalid file type."]);
        exit;
    }
    if ($image['size'] > 5000000) {  // 5MB limit
        echo json_encode(["success" => false, "error" => "File is too large."]);
        exit;
    }

    // Define a unique file name
    $filename = uniqid() . '-' . basename($image['name']);
    $imagePath = "../uploads/" . $filename;

    // Move the uploaded file
    if (move_uploaded_file($image['tmp_name'], $imagePath)) {
        // Use a prepared statement to safely update the database
        $stmt = $conn->prepare("UPDATE users SET image_path = ? WHERE id = ?");
        $stmt->bind_param("si", $imagePath, $user_id);

        // Check if the SQL query executes successfully
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(["success" => true, "message" => "Image updated successfully."]);
            } else {
                echo json_encode(["success" => false, "error" => "No rows updated. Check user_id."]);
            }
        } else {
            echo json_encode(["success" => false, "error" => "Database error: " . $stmt->error]);
        }
        $stmt->close();
    } else {
        echo json_encode(["success" => false, "error" => "Failed to move uploaded file."]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Image or user ID not provided."]);
}

$conn->close();
?>
