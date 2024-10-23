<?php
include '../0database/db_connect.php';

$data = json_decode(file_get_contents("php://input"));

$id = $data->id;
$name = $data->name;
$order_number = $data->order_number;

$sql = "UPDATE reservation SET name = ?, order_number = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('ssi', $name, $order_number, $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Failed to update']);
}
?>