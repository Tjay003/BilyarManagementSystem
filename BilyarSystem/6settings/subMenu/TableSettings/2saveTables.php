<?php
// Database connection (update with your database details)
include '../../../0database/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['tableCount'])) {
        // Get the number of tables from the request
        $tableCount = intval($_POST['tableCount']);
        
        if ($tableCount >= 0) { // Allow zero to set no tables
            // Begin transaction (optional but good practice)
            $conn->begin_transaction();

            try {
                // Clear the existing tables
                $deleteQuery = "DELETE FROM tables";
                $conn->query($deleteQuery); // Execute deletion

                // Prepare the SQL statement for insertion
                $query = "INSERT INTO tables (tableNumber) VALUES (?)";
                $stmt = $conn->prepare($query);

                // Loop to insert each table number
                for ($i = 1; $i <= $tableCount; $i++) {
                    $stmt->bind_param("i", $i); // Bind the current table number
                    $stmt->execute(); // Execute the query
                }

                // Commit the transaction
                $conn->commit();

                // Return a JSON response
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
?>
