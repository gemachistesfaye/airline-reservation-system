<?php
require_once "config/database.php";
$db = new Database();
$conn = $db->connect();

try {
    // Add 'class' column to seats table if missing
    $conn->exec("ALTER TABLE seats ADD COLUMN IF NOT EXISTS class ENUM('Economy', 'Business') DEFAULT 'Economy'");
    
    // Auto-assign Business class to rows 1-3 (Seats A1-F3)
    $conn->exec("UPDATE seats SET class = 'Business' WHERE seat_number REGEXP '^[A-F][1-3]$ ' OR seat_number REGEXP '^[1-3][A-F]$'");
    
    echo "Seat classes (Business/Economy) initialized in database.\n";
} catch (Exception $e) {
    echo "Note: " . $e->getMessage() . "\n";
}
