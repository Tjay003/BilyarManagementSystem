<?php
include '../../../0database/db_connect.php';

$query = "SELECT * FROM tables ORDER BY tableNumber";
$result = $conn->query($query);

$tables = [];
while ($row = $result->fetch_assoc()) {
    $tables[] = $row;
}

echo json_encode($tables);
$conn->close();
?>
