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

    // Check if a log with the matching timer_id exists
    $stmt = $conn->prepare("SELECT id FROM billing_logs WHERE timer_id = ?");
    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => "SQL prepare failed for selection", "error" => $conn->error]);
        exit;
    }
    $stmt->bind_param("i", $timer_id);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        // If a matching timer_id exists, update the log
        $stmt->bind_result($log_id);
        $stmt->fetch(); // Fetch the log_id

        $updateStmt = $conn->prepare("UPDATE billing_logs SET timestamp = ?, price = ?, paid = ? WHERE id = ?");
        if (!$updateStmt) {
            echo json_encode(["status" => "error", "message" => "SQL prepare failed for update", "error" => $conn->error]);
            exit;
        }

        // Bind parameters and execute the update statement
        $updateStmt->bind_param("siii", $timestamp, $price, $paid, $log_id);
        $updateStmt->execute();
        $updateStmt->close(); // Close update statement
    } else {
        // If no matching timer_id exists, insert a new log
        $insertStmt = $conn->prepare("INSERT INTO billing_logs (timer_id, timestamp, price, paid) VALUES (?, ?, ?, ?)");
        if (!$insertStmt) {
            echo json_encode(["status" => "error", "message" => "SQL prepare failed for insert", "error" => $conn->error]);
            exit;
        }

        // Bind parameters and execute the insert statement
        $insertStmt->bind_param("isdi", $timer_id, $timestamp, $price, $paid);
        $insertStmt->execute();
        $insertStmt->close(); // Close insert statement
    }

    $stmt->close(); // Close selection statement
}

// Close the connection
$conn->close();

// Return success response
echo json_encode(["status" => "success", "message" => "Billing logs processed successfully"]);
?>
