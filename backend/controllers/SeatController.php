<?php

class SeatController {

    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    // =========================
    // GET SEATS BY FLIGHT
    // =========================
    public function getSeatsByFlight() {

        $flight_id = $_GET['flight_id'] ?? null;

        if (!$flight_id) {
            echo json_encode(["status" => "error", "message" => "flight_id required"]);
            return;
        }

        $stmt = $this->conn->prepare("
            SELECT seat_number, class, availability_status
            FROM seats
            WHERE flight_id = ?
            ORDER BY seat_number
        ");

        $stmt->execute([$flight_id]);

        echo json_encode([
            "status" => "success",
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    }
}