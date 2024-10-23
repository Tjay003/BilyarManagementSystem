<?php
// Database connection (update with your database details)
include '../../../0database/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['tableCount'])) {
        $tableCount = intval($_POST['tableCount']);

        if ($tableCount > 0) {
            // Begin transaction (optional but good practice for bulk deletes)
            $conn->begin_transaction();

            try {
                // Prepare the SQL statement for deletion
                $query = "DELETE FROM tables ORDER BY id DESC LIMIT ?";
                $stmt = $conn->prepare($query);
                $stmt->bind_param("i", $tableCount);
                $stmt->execute();

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
?>
