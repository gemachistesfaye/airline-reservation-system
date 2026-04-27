<?php
require_once "config/database.php";
$db = new Database();
$conn = $db->connect();

try {
    echo "Starting Tiered Seating Migration...\n";

    // 1. Update FLIGHTS table
    $conn->exec("ALTER TABLE flights ADD COLUMN IF NOT EXISTS economy_seats_total INT DEFAULT 40 AFTER total_seats");
    $conn->exec("ALTER TABLE flights ADD COLUMN IF NOT EXISTS economy_seats_avail INT DEFAULT 40 AFTER economy_seats_total");
    $conn->exec("ALTER TABLE flights ADD COLUMN IF NOT EXISTS business_seats_total INT DEFAULT 12 AFTER economy_seats_avail");
    $conn->exec("ALTER TABLE flights ADD COLUMN IF NOT EXISTS business_seats_avail INT DEFAULT 12 AFTER business_seats_total");
    $conn->exec("ALTER TABLE flights ADD COLUMN IF NOT EXISTS first_class_seats_total INT DEFAULT 6 AFTER business_seats_avail");
    $conn->exec("ALTER TABLE flights ADD COLUMN IF NOT EXISTS first_class_seats_avail INT DEFAULT 6 AFTER first_class_seats_total");
    
    // 2. Update BOOKINGS table
    $conn->exec("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS seat_class ENUM('Economy', 'Business', 'First Class') DEFAULT 'Economy' AFTER seat_number");
    $conn->exec("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending' AFTER status");
    
    // Update existing status ENUM if needed (MySQL specific check might be hard here, but we can try to alter)
    // For simplicity, we'll just ensure the column can take 'Pending Payment'
    $conn->exec("ALTER TABLE bookings MODIFY COLUMN status ENUM('Confirmed', 'Cancelled', 'Pending Payment') DEFAULT 'Pending Payment'");

    echo "Migration Successful! Tiered seating and payment columns added.\n";

} catch (Exception $e) {
    echo "Migration Failed: " . $e->getMessage() . "\n";
}
