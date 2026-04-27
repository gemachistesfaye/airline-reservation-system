<?php

class FlightController {

    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function getAllFlights() {
        require_once __DIR__ . "/../services/SearchService.php";
        $search = new SearchService($this->conn);

        $filters = [
            'origin' => $_GET['origin'] ?? null,
            'destination' => $_GET['destination'] ?? null,
            'date' => $_GET['date'] ?? null,
            'status' => $_GET['status'] ?? null,
            'page' => $_GET['page'] ?? 1,
            'limit' => $_GET['limit'] ?? 10
        ];

        $results = $search->searchFlights($filters);

        echo json_encode([
            "status" => "success",
            "data" => $results['items'],
            "meta" => $results['meta']
        ]);
    }

    public function getFlight($id = null) {
        $flight_id = $id ?? $_GET['flight_id'] ?? null;

        if (!$flight_id) {
            echo json_encode(["status" => "error", "message" => "Flight ID required"]);
            return;
        }

        $stmt = $this->conn->prepare("SELECT * FROM flights WHERE flight_id = ?");
        $stmt->execute([$flight_id]);
        $flight = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$flight) {
            echo json_encode(["status" => "error", "message" => "Flight not found"]);
            return;
        }

        echo json_encode(["status" => "success", "data" => $flight]);
    }

    public function createFlight() {
        $data = json_decode(file_get_contents("php://input"));

        // New requirement: Class-specific seat counts
        $eco = (int)($data->economy_seats ?? 40);
        $bus = (int)($data->business_seats ?? 12);
        $fst = (int)($data->first_class_seats ?? 6);
        $total = $eco + $bus + $fst;

        if (empty($data->flight_number) || empty($data->origin) || empty($data->destination)) {
            echo json_encode(["status" => "error", "message" => "Missing required fields"]);
            return;
        }

        try {
            $this->conn->beginTransaction();

            $stmt = $this->conn->prepare("
                INSERT INTO flights (
                    flight_number, origin, destination, departure_time, arrival_time, 
                    total_seats, available_seats, 
                    economy_seats_total, economy_seats_avail, 
                    business_seats_total, business_seats_avail, 
                    first_class_seats_total, first_class_seats_avail, 
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $data->flight_number,
                $data->origin,
                $data->destination,
                $data->departure_time ?? null,
                $data->arrival_time ?? null,
                $total,
                $total,
                $eco, $eco,
                $bus, $bus,
                $fst, $fst,
                $data->status ?? 'Scheduled'
            ]);

            $flight_id = $this->conn->lastInsertId();
            $this->generateTieredSeats($flight_id, $eco, $bus, $fst);

            $this->conn->commit();

            echo json_encode([
                "status" => "success",
                "message" => "Flight " . $data->flight_number . " established with $fst First, $bus Business, and $eco Economy seats."
            ]);
        } catch (Exception $e) {
            $this->conn->rollBack();
            echo json_encode(["status" => "error", "message" => "Failed to create flight: " . $e->getMessage()]);
        }
    }

    public function updateFlight($id = null) {
        $data = json_decode(file_get_contents("php://input"));
        $flight_id = $id ?? $data->flight_id ?? null;

        if (!$flight_id) {
            echo json_encode(["status" => "error", "message" => "Flight ID is required"]);
            return;
        }

        $stmt = $this->conn->prepare("
            UPDATE flights 
            SET flight_number = ?, origin = ?, destination = ?, departure_time = ?, arrival_time = ?, status = ?
            WHERE flight_id = ?
        ");

        $success = $stmt->execute([
            $data->flight_number,
            $data->origin,
            $data->destination,
            $data->departure_time,
            $data->arrival_time,
            $data->status,
            $flight_id
        ]);

        if ($success) {
            echo json_encode(["status" => "success", "message" => "Flight updated successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to update flight"]);
        }
    }

    private function generateTieredSeats($flight_id, $eco, $bus, $fst) {
        $rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
        $cols = [1, 2, 3, 4, 5, 6];

        $stmt = $this->conn->prepare("
            INSERT INTO seats (flight_id, seat_number, class, availability_status)
            VALUES (?, ?, ?, 'available')
        ");

        // 1. Generate First Class
        $count = 0;
        for ($r = 0; $r < count($rows); $r++) {
            for ($c = 1; $c <= 6; $c++) {
                if ($count >= $fst) break 2;
                $stmt->execute([$flight_id, $rows[$r] . $c, 'First Class']);
                $count++;
            }
        }

        // 2. Generate Business Class
        $startRow = ceil($fst / 6);
        $count = 0;
        for ($r = $startRow; $r < count($rows); $r++) {
            for ($c = 1; $c <= 6; $c++) {
                if ($count >= $bus) break 2;
                $stmt->execute([$flight_id, $rows[$r] . $c, 'Business Class']);
                $count++;
            }
        }

        // 3. Generate Economy Class
        $startRow = ceil(($fst + $bus) / 6);
        $count = 0;
        for ($r = $startRow; $r < count($rows); $r++) {
            for ($c = 1; $c <= 6; $c++) {
                if ($count >= $eco) break 2;
                $stmt->execute([$flight_id, $rows[$r] . $c, 'Economy Class']);
                $count++;
            }
        }
    }
}