<?php
include '../../../0database/db_connect.php';

// Fetch all employees from the database
$query = "SELECT * FROM users WHERE role = 1 || 2"; // Assuming role = 2 is for employees
$result = $conn->query($query);

$employees = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $employees[] = $row; // Add each employee to the array
    }
}

// Return employee data as JSON
header('Content-Type: application/json');
echo json_encode($employees);

$conn->close(); // Close the database connection
?>
