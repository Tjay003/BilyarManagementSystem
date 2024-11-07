<?php
// Include the database connection details
include '../0database/db_connect.php';

// Set appropriate header for JSON response
header('Content-Type: application/json');

// Check the connection
if ($conn->connect_error) {
    echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

// Fetch total tables occupied (status is not 'available')
$queryOccupied = "SELECT COUNT(*) FROM tables WHERE status != 'available'";
$resultOccupied = $conn->query($queryOccupied);
$totalOccupied = $resultOccupied ? $resultOccupied->fetch_row()[0] : 0;

// Fetch total tables available (status is 'available')
$queryAvailable = "SELECT COUNT(*) FROM tables WHERE status = 'available'";
$resultAvailable = $conn->query($queryAvailable);
$totalAvailable = $resultAvailable ? $resultAvailable->fetch_row()[0] : 0;

// Fetch total number of tables
$queryTotal = "SELECT COUNT(*) FROM tables";
$resultTotal = $conn->query($queryTotal);
$totalTables = $resultTotal ? $resultTotal->fetch_row()[0] : 0;

// Return data as JSON
echo json_encode([
    'totalOccupied' => $totalOccupied,
    'totalAvailable' => $totalAvailable,
    'totalTables' => $totalTables
]);

// Close the connection
$conn->close();
?>
