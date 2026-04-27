<?php
require_once "config/database.php";
require_once "controllers/FlightController.php";

$db = new Database();
$conn = $db->connect();
$fc = new FlightController($conn);

$flights = $conn->query("SELECT flight_id, total_seats, flight_number FROM flights")->fetchAll(PDO::FETCH_ASSOC);

echo "REPAIRING SEATS:\n";
foreach ($flights as $f) {
    $stmt = $conn->prepare("SELECT COUNT(*) FROM seats WHERE flight_id = ?");
    $stmt->execute([$f['flight_id']]);
    $count = $stmt->fetchColumn();
    
    if ($count == 0) {
        echo "Generating {$f['total_seats']} seats for Flight {$f['flight_number']} (ID: {$f['flight_id']})...\n";
        $fc->generateSeats($f['flight_id'], $f['total_seats']);
    } else {
        echo "Flight {$f['flight_number']} already has $count seats.\n";
    }
}

echo "Repair complete.\n";
