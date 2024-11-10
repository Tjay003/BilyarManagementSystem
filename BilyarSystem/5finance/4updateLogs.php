<?php
// Include your database connection file
include '../0database/db_connect.php';

// Get the POST data
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['sessionID'])) {
    $sessionID = $data['sessionID'];
    $totalBillPaid = isset($data['totalBillPaid']) ? $data['totalBillPaid'] : null;
    $totalBillUnpaid = isset($data['totalBillUnpaid']) ? $data['totalBillUnpaid'] : null;

    // Build the SQL query based on the fields provided
    $query = "UPDATE session_logs SET ";  // Change to session_logs table
    $params = [];
    $types = '';

    // Check if `totalBillPaid` is provided and add to the query
    if ($totalBillPaid !== null) {
        $query .= "totalBillPaid = ?, ";
        $params[] = $totalBillPaid;
        $types .= 'd'; // d for double/decimal type
    }

    // Check if `totalBillUnpaid` is provided and add to the query
    if ($totalBillUnpaid !== null) {
        $query .= "totalBillUnpaid = ?, ";
        $params[] = $totalBillUnpaid;
        $types .= 'd'; // d for double/decimal type
    }

    // Remove the trailing comma and space
    $query = rtrim($query, ", ");

    // Add the condition for the sessionID
    $query .= " WHERE sessionID = ?";
    $params[] = $sessionID;
    $types .= 'i'; // i for integer type (sessionID is assumed to be an integer)

    // Prepare and execute the statement
    if ($stmt = $conn->prepare($query)) {
        $stmt->bind_param($types, ...$params);
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to update record.']);
        }
        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to prepare statement.']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Session ID not provided.']);
}

$conn->close();
?>
