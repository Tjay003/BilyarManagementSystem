<?php
// Include database connection
include '../0database/db_connect.php';

// Check if the connection was successful
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Prepare and execute the query
$sql = "
    SELECT 
        sessionID, 
        timerId, 
        startTime, 
        savedTime, 
        totalDurationSeconds, 
        totalBillAmount, 
        totalBillPaid, 
        totalBillUnpaid, 
        tableNumber, 
        timerType
    FROM 
        session_logs
";

$result = $conn->query($sql);

// Initialize an array to store the data
$data = [];

if ($result->num_rows > 0) {
    // Fetch each row and add it to the data array
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}

// Output the data as JSON
echo json_encode($data);

// Close the database connection
$conn->close();
?>
