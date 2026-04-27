<?php
require_once "config/database.php";
$db = new Database();
$conn = $db->connect();

$flights = $conn->query("SELECT flight_id, flight_number, total_seats, available_seats FROM flights")->fetchAll(PDO::FETCH_ASSOC);

echo "FLIGHTS DATA:\n";
foreach($flights as $f) {
    $booked = $conn->prepare("SELECT COUNT(*) FROM bookings WHERE flight_id = ? AND status = 'Confirmed'");
    $booked->execute([$f['flight_id']]);
    $count = $booked->fetchColumn();
    
    echo "Flight {$f['flight_number']}: Total {$f['total_seats']}, Available {$f['available_seats']}, Actually Booked {$count}\n";
}
