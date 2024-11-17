<?php
header('Content-Type: application/json');
include '../../../0database/db_connect.php';

if (isset($_POST['id'])) {
    $id = $_POST['id'];
    
    try {
        // Delete the table (session logs will be preserved with timerId set to NULL)
        $sql_table = "DELETE FROM tables WHERE id = ?";
        $stmt_table = $conn->prepare($sql_table);
        $stmt_table->bind_param('i', $id);
        
        if ($stmt_table->execute()) {
            if ($stmt_table->affected_rows > 0) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Table not found']);
            }
        } else {
            throw new Exception($stmt_table->error);
        }
        
        $stmt_table->close();
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    
    $conn->close();
    
} else {
    echo json_encode(['success' => false, 'error' => 'ID not provided']);
}
?>
