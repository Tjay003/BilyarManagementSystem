<?php
include '../0database/db_connect.php';

// Query to fetch all columns from the tables table
$query = "SELECT * FROM tables"; // Use * to fetch all columns
$result = $conn->query($query);

if ($result && $result->num_rows > 0) {
    $tables = array();

    // Fetch all rows and store them in an array
    while ($row = $result->fetch_assoc()) {
        $tables[] = $row; // Add each row to the array
    }

    // Return the data as JSON
    echo json_encode($tables);
} else {
    echo json_encode(["error" => "No tables found"]);
}
?>
