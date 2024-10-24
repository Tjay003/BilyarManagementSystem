<?php
include '../0database/db_connect.php';

// Query to fetch all columns from the tables table
$query = "SELECT 
            id,
            tableNumber,
            status,
            IFNULL(timer_type, 'regular') AS timer_type, 
            IFNULL(start_time, '-- : -- : --') AS start_time,
            IFNULL(end_time, '-- : -- : --') AS end_time,
            total_seconds,
            total_time_used,
            IFNULL(pause_time, '') AS pause_time,
            IFNULL(resume_time, '') AS resume_time,
            IFNULL(notes, 'Add Notes') AS notes
          FROM tables"; // Specify each column with IFNULL

$result = $conn->query($query);

// Check if the query executed successfully
if (!$result) {
    echo json_encode(["error" => "Query failed: " . $conn->error]);
    exit; // Exit the script to prevent further execution
}

if ($result->num_rows > 0) {
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
