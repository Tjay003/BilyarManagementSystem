<?php

// Database connection parameters
include '../0database/db_connect.php';

// Retrieve the raw JSON data from the request
$jsonData = file_get_contents("php://input");

// Decode JSON data into PHP associative array
$logs = json_decode($jsonData, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(["status" => "error", "message" => "Invalid JSON format", "error" => json_last_error_msg()]);
    exit;
}

// Loop through each log entry in the logs array and determine if it needs an update or an insert
foreach ($logs as $log) {
    $timer_id = $log['timer_id'];
    $timestamp = $log['timestamp'];
    $price = $log['price'];
    $paid = $log['paid'] ? 1 : 0; // Ensure paid is stored as 1 (true) or 0 (false)
    $log_id = isset($log['id']) ? $log['id'] : null; // Check if `id` is provided

    if ($log_id) {
        // Update existing log if `id` is provided
        $stmt = $conn->prepare("UPDATE billing_logs SET price = ?, paid = ? WHERE id = ?");
        if (!$stmt) {
            echo json_encode(["status" => "error", "message" => "SQL prepare failed for update", "error" => $conn->error]);
            exit;
        }

        // Bind parameters and execute the update statement
        $stmt->bind_param("dii", $price, $paid, $log_id);
    } else {
        // Insert a new log if `id` is not provided
        $stmt = $conn->prepare("INSERT INTO billing_logs (timer_id, timestamp, price, paid) VALUES (?, ?, ?, ?)");
        if (!$stmt) {
            echo json_encode(["status" => "error", "message" => "SQL prepare failed for insert", "error" => $conn->error]);
            exit;
        }

        // Bind parameters and execute the insert statement
        $stmt->bind_param("isdi", $timer_id, $timestamp, $price, $paid);
    }

    // Execute the statement
    if (!$stmt->execute()) {
        echo json_encode([
            "status" => "error", 
            "message" => "Failed to process log entry",
            "error" => $stmt->error,
            "log_entry" => $log
        ]);
        exit;
    }

    $stmt->close(); // Close each statement after execution
}

// Close the connection
$conn->close();

// Return success response
echo json_encode(["status" => "success", "message" => "Billing logs processed successfully"]);
?>
