<?php
header("Content-Type: application/json");

include '../0database/db_connect.php';

// Get the JSON data from the request
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['id'])) {
    $id = $data['id']; 

    // Initialize SQL query components
    $updateFields = [];
    $params = [];
    $types = "";

    // Only add fields to the query if they are set in $data
    if (isset($data['timer_type'])) {
        $updateFields[] = "timer_type = ?";
        $params[] = $data['timer_type'];
        $types .= "s";
    }
    if (isset($data['start_time'])) {
        $updateFields[] = "start_time = ?";
        $params[] = $data['start_time'];
        $types .= "s";
    }
    if (isset($data['end_time'])) {
        $updateFields[] = "end_time = ?";
        $params[] = $data['end_time'];
        $types .= "s";
    }
    if (array_key_exists('pause_time', $data)) {  // Use array_key_exists to check even if pause_time is null
        $pause_time = $data['pause_time'] === "reset" ? null : $data['pause_time'];
        $updateFields[] = "pause_time = ?";
        $params[] = $pause_time;
        $types .= "s";
    }
    if (isset($data['cumulativePause'])) {
        $updateFields[] = "cumulativePause = ?";
        $params[] = $data['cumulativePause'];
        $types .= "i";
    }
    if (isset($data['total_seconds'])) {
        $updateFields[] = "total_seconds = ?";
        $params[] = $data['total_seconds'];
        $types .= "i";
    }
    if (isset($data['status'])) {
        $updateFields[] = "status = ?";
        $params[] = $data['status'];
        $types .= "s";
    }
    if (isset($data['notes'])) {
        $updateFields[] = "notes = ?";
        $params[] = $data['notes'];
        $types .= "s";
    }

    // Add id to the end for the WHERE clause
    $params[] = $id;
    $types .= "i";

    // Construct the final SQL statement
    $updateSql = "UPDATE tables SET " . implode(", ", $updateFields) . ", updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    
    // Prepare the statement
    $stmt = $conn->prepare($updateSql);

    // Bind parameters
    $stmt->bind_param($types, ...$params);

} else {
    // Insert new record if no ID provided
    $insertSql = "INSERT INTO tables (id, timer_type, start_time, total_seconds, status, notes) 
                   VALUES (?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($insertSql);
    $stmt->bind_param("ssssss", 
        $data['id'],
        $data['timer_type'], 
        $data['start_time'], 
        $data['total_seconds'], 
        $data['status'], 
        $data['notes']
    );
}

// Execute the statement and check for success
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Session saved successfully.']);
} else {
    echo json_encode(['error' => 'Failed to save session: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
