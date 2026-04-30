<?php
require 'backend/config/Database.php';

$db = new Database();
$conn = $db->connect();

try {
    // Add columns to bookings if they don't exist
    $conn->exec("ALTER TABLE bookings 
        ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER seat_class,
        ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0.00 AFTER base_price,
        ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER discount_amount
    ");
    echo "Bookings table updated.\n";
    
    // Ensure seats class enum matches flights (Economy Class, Business Class, First Class)
    // Actually in the previous output it was 'Economy', 'Business', 'First Class'
    // database.sql says: ENUM('Economy Class', 'Business Class', 'First Class')
    // We will update both bookings and seats just in case to be consistent.
    $conn->exec("ALTER TABLE seats MODIFY COLUMN class ENUM('Economy Class', 'Business Class', 'First Class') DEFAULT 'Economy Class'");
    $conn->exec("ALTER TABLE bookings MODIFY COLUMN seat_class ENUM('Economy Class', 'Business Class', 'First Class') NOT NULL");

    // We can also run the full database.sql again just to insert the sample flights/admins if missing.
    $sql = file_get_contents('database.sql');
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    foreach ($statements as $stmt) {
        if (!empty($stmt)) {
            $conn->exec($stmt);
        }
    }

    echo "Schema updates applied successfully.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
