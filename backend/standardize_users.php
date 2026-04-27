<?php
require_once "config/database.php";
$db = new Database();
$conn = $db->connect();

try {
    // Standardize column names for the new 'users' table
    $conn->exec("ALTER TABLE users CHANGE passenger_id id INT(11) AUTO_INCREMENT PRIMARY KEY");
    echo "Column passenger_id renamed to id.\n";
} catch (Exception $e) {
    echo "Note: " . $e->getMessage() . "\n";
}
