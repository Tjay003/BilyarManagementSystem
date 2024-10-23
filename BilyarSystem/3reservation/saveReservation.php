<?php
// Include your database connection file
include '../0database/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = $_POST['name'];
    $order_number = $_POST['order_number'];
    
    // Prepare SQL statement to insert data
    $stmt = $conn->prepare("INSERT INTO reservation (order_number, name, created_at) VALUES (?, ?, NOW())");
    $stmt->bind_param("is", $order_number, $name);
    
    if ($stmt->execute()) {
        // Return the inserted row as a JSON response
        $id = $stmt->insert_id;
        echo json_encode([
            'id' => $id,
            'name' => $name,
            'order_number' => $order_number,
            'created_at' => date('Y-m-d H:i:s')
        ]);
    } else {
        echo json_encode(['error' => 'Failed to save data']);
    }
    
    $stmt->close();
    $conn->close();
}
?>
