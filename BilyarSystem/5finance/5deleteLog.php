<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Connect to the database
include '../0database/db_connect.php';

// Get the JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['sessionID'])) {
    $sessionID = intval($data['sessionID']);

    // Prepare and execute the delete query
    $stmt = $conn->prepare("DELETE FROM session_logs WHERE sessionID = ?");
    $stmt->bind_param("i", $sessionID);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(["success" => true, "message" => "Employee deleted successfully."]);
        } else {
            echo json_encode(["success" => false, "error" => "No record found with this ID."]);
        }
    } else {
        echo json_encode(["success" => false, "error" => "Database error: " . $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(["success" => false, "error" => "User ID not provided."]);
}

$conn->close();
?>
