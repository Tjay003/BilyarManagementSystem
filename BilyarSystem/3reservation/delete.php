<?php
include '../0database/db_connect.php';

$input = json_decode(file_get_contents('php://input'), true);
if (isset($input['id'])) {
    $id = $input['id'];

    $sql = "DELETE FROM reservation WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }

    $stmt->close();
    $conn->close();
}
?>
