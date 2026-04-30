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
    // FLIGHT MANAGEMENT
    // =====================
    public function addFlight() {
        $this->auth->requireAdmin();
        (new FlightController($this->conn))->createFlight();
    }

    public function updateFlight($id = null) {
        $this->auth->requireAdmin();
        (new FlightController($this->conn))->updateFlight($id);
    }

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
    // BOOKING MANAGEMENT
    // =====================
    public function getAllBookings() {
        $this->auth->requireAdmin();

        $stmt = $this->conn->prepare("
            SELECT 
                b.booking_id,
                u.name as user_name,
                f.flight_number,
                f.origin,
                f.destination,
                b.seat_number,
                b.seat_class,
                b.booking_date,
                b.status,
                b.total_price,
                b.ticket_number
            FROM bookings b
            JOIN users u ON b.user_id = u.id
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
    // USER MANAGEMENT
    // =====================
    public function getAllUsers() {
        $this->auth->requireAdmin();
        $stmt = $this->conn->query("SELECT id, name, email, role, user_type, is_verified, created_at FROM users ORDER BY created_at DESC");
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

    // =====================
    // ADVANCED ANALYTICS
    // =====================
    public function stats() {
        $this->auth->requireAdmin();

        $flights    = $this->conn->query("SELECT COUNT(*) as total FROM flights")->fetch();
        $bookings   = $this->conn->query("SELECT COUNT(*) as total FROM bookings WHERE status != 'Cancelled'")->fetch();
        $revenue    = $this->conn->query("SELECT SUM(total_price) as total FROM bookings WHERE payment_status = 'paid'")->fetch();
        $users      = $this->conn->query("SELECT COUNT(*) as total FROM users WHERE role = 'user'")->fetch();

        echo json_encode([
            "status" => "success",
            "data" => [
                "flights"    => (int)$flights['total'],
                "bookings"   => (int)$bookings['total'],
                "revenue"    => (float)($revenue['total'] ?? 0),
                "passengers" => (int)$users['total']
            ]
        ]);
    }

    public function analytics() {
        $this->auth->requireAdmin();
        
        // 1. Overall Occupancy
        $occupancy = $this->conn->query("
            SELECT flight_number, total_seats, available_seats,
            ROUND(((total_seats - available_seats) / total_seats) * 100, 1) as occupancy_rate
            FROM flights WHERE status != 'Cancelled'
            ORDER BY occupancy_rate DESC LIMIT 5
        ")->fetchAll(PDO::FETCH_ASSOC);

        // 2. Class-specific Seat Usage
        $classUsage = $this->conn->query("
            SELECT 
                SUM(economy_seats_total - economy_seats_avail) as economy_booked,
                SUM(business_seats_total - business_seats_avail) as business_booked,
                SUM(first_class_seats_total - first_class_seats_avail) as first_booked
            FROM flights
        ")->fetch(PDO::FETCH_ASSOC);

        // 3. Booking Trends (Last 7 Days)
        $trends = $this->conn->query("
            SELECT DATE(booking_date) as date, COUNT(*) as count
            FROM bookings GROUP BY DATE(booking_date) ORDER BY date DESC LIMIT 7
        ")->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "status" => "success", 
            "data" => [
                "occupancy" => $occupancy, 
                "classUsage" => $classUsage,
                "trends" => array_reverse($trends)
            ]
        ]);
    }
}