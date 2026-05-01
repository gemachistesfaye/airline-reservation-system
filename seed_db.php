<?php
require_once "backend/config/Database.php";

$db = new Database();
$conn = $db->connect();

try {
    echo "Resetting Database...\n";
    
    // 1. Wipe everything
    $conn->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $conn->exec("TRUNCATE TABLE bookings;");
    $conn->exec("TRUNCATE TABLE seats;");
    $conn->exec("TRUNCATE TABLE flights;");
    $conn->exec("TRUNCATE TABLE users;");
    $conn->exec("SET FOREIGN_KEY_CHECKS = 1;");

    // 2. Add requested Admin
    // Admin@admin.com / Admin1234
    $adminPass = password_hash('Admin1234', PASSWORD_BCRYPT);
    $stmt = $conn->prepare("INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute(['AeroSpace Admin', 'Admin@admin.com', $adminPass, 'admin', 1]);
    
    echo "Admin created: Admin@admin.com / Admin1234\n";

    // 3. Add Sample Flight via AdminController logic (simulated)
    $flights = [
        ['flight_number' => 'AS-101', 'origin' => 'London (LHR)', 'destination' => 'Dubai (DXB)', 'base_price' => 450, 'eco' => 40, 'bus' => 12, 'first' => 6],
        ['flight_number' => 'AS-202', 'origin' => 'Paris (CDG)', 'destination' => 'New York (JFK)', 'base_price' => 600, 'eco' => 40, 'bus' => 12, 'first' => 6]
    ];

    foreach ($flights as $f) {
        $total = $f['eco'] + $f['bus'] + $f['first'];
        $stmt = $conn->prepare("
            INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, base_price, economy_seats_total, economy_seats_avail, business_seats_total, business_seats_avail, first_class_seats_total, first_class_seats_avail, total_seats, available_seats)
            VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 57 HOUR), ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $f['flight_number'], $f['origin'], $f['destination'], $f['base_price'],
            $f['eco'], $f['eco'], $f['bus'], $f['bus'], $f['first'], $f['first'],
            $total, $total
        ]);
        
        $flightId = $conn->lastInsertId();
        generateSeats($conn, $flightId, $f['eco'], $f['bus'], $f['first']);
        echo "Flight created: {$f['flight_number']}\n";
    }

    echo "Database successfully seeded!\n";

} catch (Exception $e) {
    echo "Error seeding database: " . $e->getMessage() . "\n";
}

function generateSeats($conn, $flightId, $eco, $bus, $first) {
    $rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    $currentRow = 1;

    // First Class (2 seats per row)
    for ($i = 0; $i < ceil($first/2); $i++) {
        foreach (['A', 'F'] as $l) {
            if ($first-- > 0) addSeat($conn, $flightId, $l . $currentRow, 'First Class');
        }
        $currentRow++;
    }

    // Business Class (4 seats per row)
    for ($i = 0; $i < ceil($bus/4); $i++) {
        foreach (['A', 'C', 'D', 'F'] as $l) {
            if ($bus-- > 0) addSeat($conn, $flightId, $l . $currentRow, 'Business Class');
        }
        $currentRow++;
    }

    // Economy Class (6 seats per row)
    for ($i = 0; $i < ceil($eco/6); $i++) {
        foreach ($rows as $l) {
            if ($eco-- > 0) addSeat($conn, $flightId, $l . $currentRow, 'Economy Class');
        }
        $currentRow++;
    }
}

function addSeat($conn, $fId, $num, $class) {
    $conn->prepare("INSERT INTO seats (flight_id, seat_number, class) VALUES (?, ?, ?)")->execute([$fId, $num, $class]);
}
