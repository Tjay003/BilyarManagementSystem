<?php
// Database connection (update with your database details)
include '../../../0database/db_connect.php';

$input = json_decode(file_get_contents('php://input'), true);
if (isset($input['id']) && isset($input['tableNumber'])) {
    $id = $input['id'];
    $tableNumber = $input['tableNumber'];

    // Prepare and execute the update query
    $sql = "UPDATE tables SET tableNumber = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('si', $tableNumber, $id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }

    $stmt->close();
    $conn->close();
}
?>
