<?php
require_once "backend/config/Database.php";

$db = new Database();
$conn = $db->connect();

try {
    $conn->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS status ENUM('active', 'restricted') DEFAULT 'active' AFTER is_verified;");
    echo "User status column added successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
