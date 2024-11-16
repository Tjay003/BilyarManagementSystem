<?php
include '../BilyarSystem/0database/db_connect.php';

$sql = "SELECT id, order_number, name, created_at FROM reservation";
$result = $conn->query($sql);

$reservations = array();

// Check if there are any results
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Convert to Philippines time zone and format
        $datetime = new DateTime($row['created_at'], new DateTimeZone('UTC'));
        $datetime->setTimezone(new DateTimeZone('Asia/Manila'));

        // Add extra 4 hours
        $datetime->modify('+16 hours');

        $formattedTime = $datetime->format('g:i A'); // Format to 12-hour time with AM/PM
        
        $reservations[] = array(
            'id' => $row['id'],
            'order_number' => $row['order_number'],
            'name' => $row['name'],
            'created_at' => $formattedTime  // Use formatted time here
        );
    }
} else {
    // No reservations found
    $reservations[] = array(
        'message' => 'Great news! There are no reservations in queue.'
    );
}

echo json_encode($reservations);
?>
