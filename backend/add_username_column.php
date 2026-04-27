<?php
require_once "config/database.php";
$db = new Database();
$conn = $db->connect();
try {
    $conn->exec("ALTER TABLE passengers ADD COLUMN username VARCHAR(50) UNIQUE AFTER last_name");
    echo "Username column added successfully!\n";
} catch (Exception $e) {
    echo "Column might already exist or error: " . $e->getMessage() . "\n";
}
