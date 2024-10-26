<?php
header("Content-Type: application/json");

include '../0database/db_connect.php';

// Get the JSON data from the request
$data = json_decode(file_get_contents("php://input"), true);

// Prepare the SQL statement
if (isset($data['id'])) {
    // Check if the id already exists for update
    $id = $data['id']; // Use 'id' from the data array

    $updateSql = "UPDATE tables SET
                    timer_type = COALESCE(?, timer_type),
                    start_time = COALESCE(?, start_time),
                    end_time = COALESCE(?, end_time),
                    pause_time = COALESCE(?, pause_time),
                    resume_time = COALESCE(?, resume_time),
                    total_seconds = COALESCE(?, total_seconds),
                    status = COALESCE(?, status),
                    notes = COALESCE(?, notes),
                    updated_at = CURRENT_TIMESTAMP 
                  WHERE id = ?";

    $stmt = $conn->prepare($updateSql);
    $stmt->bind_param("sssssissi", 
        $data['timer_type'],
        $data['start_time'],
        $data['end_time'], 
        $data['pause_time'], 
        $data['resume_time'], 
        $data['total_seconds'], 
        $data['status'], 
        $data['notes'], 
        $id // Use $id here
    );

} else {
    // Insert new record
    $insertSql = "INSERT INTO tables (id, timer_type, start_time, total_seconds, status, notes) 
                   VALUES (?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($insertSql);
    $stmt->bind_param("ssssss", 
        $data['id'], // Use 'id' from the data array
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
