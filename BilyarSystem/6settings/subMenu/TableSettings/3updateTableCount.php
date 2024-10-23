<?php
include '../../../0database/db_connect.php';

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'];

    if ($action === 'increment') {
        // Get the current highest table number
        $result = $conn->query("SELECT MAX(tableNumber) AS maxTableNumber FROM tables");
        $row = $result->fetch_assoc();
        $nextTableNumber = $row['maxTableNumber'] + 1; // Increment to the next table number

        // Insert the new table
        $insertQuery = "INSERT INTO tables (tableNumber) VALUES ($nextTableNumber)";
        if ($conn->query($insertQuery) === TRUE) {
            echo json_encode(['success' => true, 'action' => 'increment']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to add table.']);
        }
    } elseif ($action === 'decrement') {
        // Remove the last table based on the highest table number
        $deleteQuery = "DELETE FROM tables ORDER BY tableNumber DESC LIMIT 1"; // Delete the last row
        if ($conn->query($deleteQuery) === TRUE) {
            echo json_encode(['success' => true, 'action' => 'decrement']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to remove table.']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid action.']);
    }

    $conn->close();
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
}
?>
