<?php
try {
    $conn = new PDO("mysql:host=localhost;dbname=airline_db", "root", "");
    $stmt = $conn->query("UPDATE users SET role = 'admin' LIMIT 1");
    if ($stmt->rowCount() > 0) {
        echo "SUCCESS: A user has been promoted to admin.";
    } else {
        echo "ERROR: No users found to promote.";
    }
} catch (Exception $e) {
    echo "DB ERROR: " . $e->getMessage();
}
