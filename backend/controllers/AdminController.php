<?php

require_once __DIR__ . "/../middleware/AuthMiddleware.php";
require_once "FlightController.php";

class AdminController {

    private $conn;
    private $auth;

    public function __construct($conn) {
        $this->conn = $conn;
        $this->auth = new AuthMiddleware();
    }

    // =====================
    // ADD FLIGHT
    // =====================
    public function addFlight() {
        $this->auth->requireAdmin();
        (new FlightController($this->conn))->createFlight();
    }

    public function updateFlight($id = null) {
        $this->auth->requireAdmin();
        (new FlightController($this->conn))->updateFlight($id);
    }

    // =====================
    // GET ALL BOOKINGS (ADMIN VIEW)
    // =====================
    public function getAllBookings() {
        $this->auth->requireAdmin();

        $stmt = $this->conn->prepare("
            SELECT 
                b.booking_id,
                p.first_name,
                p.last_name,
                f.flight_number,
                f.origin,
                f.destination,
                b.seat_number,
                b.booking_date,
                b.status,
                b.ticket_number
            FROM bookings b
            JOIN users p ON b.user_id = p.id
            JOIN flights f ON b.flight_id = f.flight_id
            ORDER BY b.booking_date DESC
        ");

        $stmt->execute();

        echo json_encode([
            "status" => "success",
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    }

    // =====================
    // DELETE FLIGHT
    // =====================
    public function deleteFlight() {
        $this->auth->requireAdmin();
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->flight_id)) {
            echo json_encode(["status" => "error", "message" => "Flight ID is required"]);
            return;
        }

        $stmt = $this->conn->prepare("DELETE FROM flights WHERE flight_id = ?");
        $stmt->execute([$data->flight_id]);

        echo json_encode(["status" => "success", "message" => "Flight deleted successfully"]);
    }

    // =====================
    // DASHBOARD STATS
    // =====================
    public function stats() {
        $this->auth->requireAdmin();

        $flights    = $this->conn->query("SELECT COUNT(*) as total FROM flights")->fetch();
        $bookings   = $this->conn->query("SELECT COUNT(*) as total FROM bookings")->fetch();
        $users      = $this->conn->query("SELECT COUNT(*) as total FROM users WHERE role = 'user'")->fetch();

        echo json_encode([
            "status" => "success",
            "data" => [
                "flights"    => (int)$flights['total'],
                "bookings"   => (int)$bookings['total'],
                "passengers" => (int)$users['total']
            ]
        ]);
    }

    public function getAllUsers() {
        $this->auth->requireAdmin();
        $stmt = $this->conn->query("SELECT id, first_name, last_name, email, role, is_verified, created_at FROM users ORDER BY created_at DESC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    public function toggleUserStatus() {
        $this->auth->requireAdmin();
        $data = json_decode(file_get_contents("php://input"));
        if (empty($data->id)) {
            echo json_encode(["status" => "error", "message" => "User ID required"]);
            return;
        }
        $stmt = $this->conn->prepare("UPDATE users SET is_verified = NOT is_verified WHERE id = ?");
        $stmt->execute([$data->id]);
        echo json_encode(["status" => "success", "message" => "User status updated"]);
    }

    public function analytics() {
        $this->auth->requireAdmin();
        $occupancy = $this->conn->query("
            SELECT flight_number, total_seats, available_seats,
            ROUND(((total_seats - available_seats) / total_seats) * 100, 1) as occupancy_rate
            FROM flights ORDER BY occupancy_rate DESC LIMIT 5
        ")->fetchAll(PDO::FETCH_ASSOC);

        $trends = $this->conn->query("
            SELECT DATE(booking_date) as date, COUNT(*) as count
            FROM bookings GROUP BY DATE(booking_date) ORDER BY date DESC LIMIT 7
        ")->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "success", "data" => ["occupancy" => $occupancy, "trends" => $trends]]);
    }
}