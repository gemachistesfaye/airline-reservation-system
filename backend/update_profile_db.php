<?php
require_once "config/database.php";
$db = new Database();
$conn = $db->connect();

try {
    // Add missing fields from proposal Table 7.1
    $conn->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) AFTER email");
    $conn->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS passport_number VARCHAR(50) AFTER phone_number");
    $conn->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE AFTER passport_number");
    
    echo "Profile fields (Phone, Passport, DOB) verified and added to database.\n";
} catch (Exception $e) {
    echo "Note: " . $e->getMessage() . "\n";
}
