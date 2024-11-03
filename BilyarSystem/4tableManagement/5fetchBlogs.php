<?php
// Database connection parameters
include '../0database/db_connect.php';

// Get the timer_id from the query string
$timer_id = isset($_GET['timer_id']) ? intval($_GET['timer_id']) : 0;

// Fetch billing logs for the specified timer_id
$query = $conn->prepare("SELECT id, timer_id, timestamp, price, paid FROM billing_logs WHERE timer_id = ?");
$query->bind_param("i", $timer_id);
$query->execute();
$result = $query->get_result();

// Initialize an empty array to hold billing logs
$billingLogs = [];

// Check if any logs were found
if ($result->num_rows > 0) {
    $billingLogs = $result->fetch_all(MYSQLI_ASSOC);
}

// Return response with logs or an empty array
echo json_encode([
    "status" => "success",
    "data" => $billingLogs,
    "message" => $result->num_rows > 0 ? "" : "No billing logs found for the specified timer ID."
]);

// Clean up
$query->close();
$conn->close();
?>
