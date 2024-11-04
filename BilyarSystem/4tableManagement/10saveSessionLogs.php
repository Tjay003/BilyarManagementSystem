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
    $timerId = $log['timerId'];
    $startTime = $log['startTime'];
    $savedTime = $log['savedTime'];
    $totalDurationSeconds = $log['totalDurationSeconds'];
    $totalBillAmount = $log['totalBillAmount'];
    $totalBillPaid = $log['totalBillPaid'];
    $totalBillUnpaid = $log['totalBillUnpaid'];
    $tableNumber = $log['tableNumber'];
    $timerType = $log['timerType'];
    $sessionId = isset($log['sessionID']) ? $log['sessionID'] : null; // Check if `sessionID` is provided

    // Prepare the SQL statement based on whether an id is provided for updating or inserting
    if ($sessionId) {
        // Update existing log if `sessionID` is provided
        $stmt = $conn->prepare("UPDATE session_logs SET timerId = ?, startTime = ?, savedTime = ?, totalDurationSeconds = ?, totalBillAmount = ?, totalBillPaid = ?, totalBillUnpaid = ?, tableNumber = ?, timerType = ? WHERE sessionID = ?");
        if (!$stmt) {
            echo json_encode(["status" => "error", "message" => "SQL prepare failed for update", "error" => $conn->error]);
            exit;
        }

        // Bind parameters for update
        $stmt->bind_param("issidddiis", $timerId, $startTime, $savedTime, $totalDurationSeconds, $totalBillAmount, $totalBillPaid, $totalBillUnpaid, $tableNumber, $timerType, $sessionId);
    } else {
        // Insert a new log if `sessionID` is not provided
        $stmt = $conn->prepare("INSERT INTO session_logs (timerId, startTime, savedTime, totalDurationSeconds, totalBillAmount, totalBillPaid, totalBillUnpaid, tableNumber, timerType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        if (!$stmt) {
            echo json_encode(["status" => "error", "message" => "SQL prepare failed for insert", "error" => $conn->error]);
            exit;
        }

        // Bind parameters for insert
        $stmt->bind_param("issidddis", $timerId, $startTime, $savedTime, $totalDurationSeconds, $totalBillAmount, $totalBillPaid, $totalBillUnpaid, $tableNumber, $timerType);
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
