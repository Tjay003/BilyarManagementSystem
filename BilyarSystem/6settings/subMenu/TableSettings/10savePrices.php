<?php
header('Content-Type: application/json');
include '../../../0database/db_connect.php';

try {
    if (!isset($_POST['type']) || !isset($_POST['price'])) {
        throw new Exception('Price type and value must be provided');
    }

    $type = $_POST['type'];
    $price = floatval($_POST['price']);

    // Validate price
    if ($price < 0) {
        throw new Exception('Price cannot be negative');
    }

    // Check if prices already exist
    $check_sql = "SELECT * FROM table_prices LIMIT 1";
    $result = $conn->query($check_sql);

    if ($result->num_rows > 0) {
        // Update existing price
        $sql = $type === 'half_hour' 
            ? "UPDATE table_prices SET half_hour_price = ?"
            : "UPDATE table_prices SET hour_price = ?";
    } else {
        // Insert new price record
        $sql = $type === 'half_hour'
            ? "INSERT INTO table_prices (half_hour_price, hour_price) VALUES (?, 0)"
            : "INSERT INTO table_prices (half_hour_price, hour_price) VALUES (0, ?)";
    }

    $stmt = $conn->prepare($sql);
    $stmt->bind_param('d', $price);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        throw new Exception($stmt->error);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>