<?php
// Database connection parameters
include '../0database/db_connect.php';

// Get the JSON data from the request body
$data = json_decode(file_get_contents('php://input'), true);
$logId = isset($data['id']) ? intval($data['id']) : 0;
$newPrice = isset($data['price']) ? $data['price'] : '';

// Prepare and execute the update query
$query = $conn->prepare("UPDATE billing_logs SET price = ? WHERE id = ?");
$query->bind_param("si", $newPrice, $logId);
if ($query->execute()) {
    echo json_encode([
        "status" => "success",
        "message" => "Billing log updated successfully."
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Error updating billing log."
    ]);
}

// Clean up
$query->close();
$conn->close();
?>
