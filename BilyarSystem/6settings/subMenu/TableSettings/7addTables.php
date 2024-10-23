<?php
// Database connection (update with your database details)
include '../../../0database/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['tableCount'])) {
        $tableCount = intval($_POST['tableCount']);

        if ($tableCount > 0) {
            // Begin transaction (optional but good practice for bulk inserts)
            $conn->begin_transaction();

            try {
                // Prepare the SQL statement once
                $query = "INSERT INTO tables (tableNumber) VALUES (?)";
                $stmt = $conn->prepare($query);

                // Loop to insert each table number
                for ($i = 1; $i <= $tableCount; $i++) {
                    $tableNumber = getMaxTableNumber($conn) + $i; // Incrementing from the max table number
                    $stmt->bind_param("i", $tableNumber);
                    $stmt->execute();
                }

                // Commit the transaction
                $conn->commit();
                echo json_encode(["success" => true]);
            } catch (Exception $e) {
                // Rollback if there's an error
                $conn->rollback();
                echo json_encode(["success" => false, "error" => $e->getMessage()]);
            } finally {
                $stmt->close();
                $conn->close();
            }
        } else {
            echo json_encode(["success" => false, "error" => "Invalid table count."]);
        }
    }
}

// Function to get the maximum table number from the database
function getMaxTableNumber($conn) {
    $result = $conn->query("SELECT MAX(tableNumber) as maxTableNumber FROM tables");
    $row = $result->fetch_assoc();
    return $row['maxTableNumber'] ? $row['maxTableNumber'] : 0;
}
?>
