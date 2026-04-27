<?php
require_once "config/database.php";
$db = new Database();
$conn = $db->connect();

$flight_id = 1;
$stmt = $conn->prepare("SELECT COUNT(*) FROM seats WHERE flight_id = ?");
$stmt->execute([$flight_id]);
$count = $stmt->fetchColumn();

echo "Flight $flight_id has $count seats in the seats table.\n";

$available = $conn->prepare("SELECT seat_number FROM seats WHERE flight_id = ? AND availability_status = 'available' LIMIT 5");
$available->execute([$flight_id]);
$seats = $available->fetchAll(PDO::FETCH_COLUMN);

echo "Sample available seats: " . implode(", ", $seats) . "\n";
