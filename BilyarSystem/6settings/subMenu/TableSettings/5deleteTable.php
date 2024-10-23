<?php
// Database connection (update with your database details)
include '../../../0database/db_connect.php';

// Check if the 'id' is set in the POST request
if (isset($_POST['id'])) {
    $id = $_POST['id']; // Retrieve the id from POST data

    // Prepare the DELETE statement
    $sql = "DELETE FROM tables WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $id);

    // Execute the statement and check for success
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }

    // Close the statement and connection
    $stmt->close();
    $conn->close();
} else {
    // Handle the case where 'id' is not provided
    echo json_encode(['success' => false, 'error' => 'ID not provided']);
}
?>
