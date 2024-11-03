<?php
// Database connection parameters
include '../0database/db_connect.php';

// Get the JSON data from the request body
$data = json_decode(file_get_contents('php://input'), true);
$logId = isset($data['id']) ? intval($data['id']) : 0;

// Prepare and execute the delete query
$query = $conn->prepare("DELETE FROM billing_logs WHERE id = ?");
$query->bind_param("i", $logId);
if ($query->execute()) {
    echo json_encode([
        "status" => "success",
        "message" => "Billing log deleted successfully."
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Error deleting billing log."
    ]);
}

// Clean up
$query->close();
$conn->close();
?>
