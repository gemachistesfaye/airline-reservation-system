<?php
require_once "config/database.php";
$db = new Database();
$conn = $db->connect();

try {
    // 1. Rename passenger_id to id
    $conn->exec("ALTER TABLE users CHANGE passenger_id id INT(11) AUTO_INCREMENT");
    echo "Column renamed to id.\n";
} catch (Exception $e) {
    echo "Error renaming column: " . $e->getMessage() . "\n";
}

try {
    // 2. Ensure role column exists and is correct
    $conn->exec("ALTER TABLE users MODIFY role ENUM('admin', 'user') DEFAULT 'user'");
    echo "Role column verified.\n";
} catch (Exception $e) {
    echo "Error verifying role: " . $e->getMessage() . "\n";
}
