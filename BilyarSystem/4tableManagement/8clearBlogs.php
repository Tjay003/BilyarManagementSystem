<?php

// Database connection parameters
include '../0database/db_connect.php';

// Retrieve the raw JSON data from the request
$jsonData = file_get_contents("php://input");
$data = json_decode($jsonData, true);

// Validate JSON and retrieve the timer_id
if (json_last_error() !== JSON_ERROR_NONE || !isset($data['timer_id'])) {
    echo json_encode(["status" => "error", "message" => "Invalid JSON format or missing timer_id"]);
    exit;
}

$timer_id = $data['timer_id'];

// Prepare SQL statement to delete billing logs for the specific timer
$stmt = $conn->prepare("DELETE FROM billing_logs WHERE timer_id = ?");
if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "SQL prepare failed", "error" => $conn->error]);
    exit;
}

// Bind parameters and execute the statement
$stmt->bind_param("i", $timer_id);
if (!$stmt->execute()) {
    echo json_encode(["status" => "error", "message" => "Failed to delete billing logs", "error" => $stmt->error]);
    exit;
}

// Close the statement and connection
$stmt->close();
$conn->close();

// Return success response
echo json_encode(["status" => "success", "message" => "Billing logs cleared successfully"]);
?>
