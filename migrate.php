<?php
require 'backend/config/Database.php';
$db = new Database();
$conn = $db->connect();

try {
    $conn->exec("ALTER TABLE users ADD COLUMN user_type ENUM('regular', 'student') DEFAULT 'regular'");
    echo "Added user_type to users.\n";
} catch (Exception $e) {
    echo "user_type may already exist or error: " . $e->getMessage() . "\n";
}

try {
    $conn->exec("ALTER TABLE flights ADD COLUMN base_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00");
    echo "Added base_price to flights.\n";
} catch (Exception $e) {
    echo "base_price may already exist or error: " . $e->getMessage() . "\n";
}
