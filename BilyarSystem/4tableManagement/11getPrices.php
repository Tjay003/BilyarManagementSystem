<?php
header('Content-Type: application/json');
// Database connection parameters
include '../0database/db_connect.php';

try {
    // Query to get the current prices
    $sql = "SELECT half_hour_price, hour_price FROM table_prices LIMIT 1";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        // If prices exist, return them
        $prices = $result->fetch_assoc();
        echo json_encode([
            'success' => true,
            'prices' => [
                'half_hour_price' => floatval($prices['half_hour_price']),
                'hour_price' => floatval($prices['hour_price'])
            ]
        ]);
    } else {
        // If no prices exist yet, return defaults
        echo json_encode([
            'success' => true,
            'prices' => [
                'half_hour_price' => 0.00,
                'hour_price' => 0.00
            ]
        ]);
    }

    $conn->close();

} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'error' => $e->getMessage()
    ]);
}
?>
