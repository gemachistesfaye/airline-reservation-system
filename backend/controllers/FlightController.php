<?php

class FlightController {

    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    // =========================
    // GET ALL FLIGHTS (WITH SEARCH & PAGINATION)
    // =========================
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

    // =========================
    // GET SINGLE FLIGHT
    // =========================
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

    // =========================
    // CREATE FLIGHT + SEATS
    // =========================
    public function createFlight() {

        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->flight_number) || empty($data->origin) || empty($data->destination) || empty($data->total_seats)) {
            echo json_encode(["status" => "error", "message" => "Missing required fields"]);
            return;
        }

        try {
            $this->conn->beginTransaction();

            $stmt = $this->conn->prepare("
                INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, total_seats, available_seats, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $data->flight_number,
                $data->origin,
                $data->destination,
                $data->departure_time ?? null,
                $data->arrival_time ?? null,
                $data->total_seats,
                $data->total_seats,
                $data->status ?? 'Scheduled'
            ]);

            $flight_id = $this->conn->lastInsertId();
            $this->generateSeats($flight_id, $data->total_seats);

            $this->conn->commit();

            echo json_encode([
                "status" => "success",
                "message" => "Flight " . $data->flight_number . " created successfully with " . $data->total_seats . " seats."
            ]);
        } catch (Exception $e) {
            $this->conn->rollBack();
            echo json_encode(["status" => "error", "message" => "Failed to create flight: " . $e->getMessage()]);
        }
    }

    // =========================
    // UPDATE FLIGHT
    // =========================
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

    // =========================
    // SEAT GENERATION SYSTEM
    // =========================
    public function generateSeats($flight_id, $totalSeats) {

        $rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        $cols = [1, 2, 3, 4, 5, 6];

        $count = 0;
        foreach ($rows as $r) {
            foreach ($cols as $c) {
                if ($count >= $totalSeats) break 2;

                $seatNumber = $r . $c;
                $class = 'Economy';
                if ($r === 'A') $class = 'First';
                elseif ($r === 'B') $class = 'Business';

                $stmt = $this->conn->prepare("
                    INSERT INTO seats (flight_id, seat_number, class, availability_status)
                    VALUES (?, ?, ?, 'available')
                ");
                $stmt->execute([$flight_id, $seatNumber, $class]);
                $count++;
            }
        }
    }
}