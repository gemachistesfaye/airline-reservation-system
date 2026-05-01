<?php

require_once __DIR__ . "/../middleware/AuthMiddleware.php";

class AdminController {

    private $conn;
    private $auth;

    public function __construct($conn) {
        $this->conn = $conn;
        $this->auth = new AuthMiddleware();
    }

    private function sendJSON($data, $statusCode = 200) {
        header('Content-Type: application/json');
        http_response_code($statusCode);
        ob_clean();
        echo json_encode($data);
        exit;
    }

    // --- DASHBOARD STATS ---
    public function getStats() {
        $this->auth->requireAdmin();
        
        $userCount = $this->conn->query("SELECT COUNT(*) FROM users WHERE role = 'user'")->fetchColumn();
        $flightCount = $this->conn->query("SELECT COUNT(*) FROM flights")->fetchColumn();
        $bookingCount = $this->conn->query("SELECT COUNT(*) FROM bookings WHERE status != 'Cancelled'")->fetchColumn();
        $totalRev = $this->conn->query("SELECT SUM(total_price) FROM bookings WHERE status = 'Confirmed'")->fetchColumn();

        $this->sendJSON([
            "status" => "success",
            "data" => [
                "users" => (int)$userCount,
                "flights" => (int)$flightCount,
                "bookings" => (int)$bookingCount,
                "revenue" => round((float)$totalRev, 2)
            ]
        ]);
    }

    // --- STUDENT VERIFICATION ---
    public function getStudentVerifications() {
        $this->auth->requireAdmin();
        $stmt = $this->conn->query("
            SELECT id, name, email, student_id_file, passport_file, student_verification_status 
            FROM users 
            WHERE is_student = 1 AND student_verification_status = 'pending'
        ");
        $this->sendJSON(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    public function reviewStudentVerification($userId) {
        $this->auth->requireAdmin();
        $data = json_decode(file_get_contents("php://input"));
        $action = $data->action ?? null; // 'approve' or 'reject'

        if (!in_array($action, ['approve', 'reject'])) {
            $this->sendJSON(["status" => "error", "message" => "Invalid action"], 400);
        }

        $verified = ($action === 'approve') ? 1 : 0;
        $status = ($action === 'approve') ? 'approved' : 'rejected';

        $stmt = $this->conn->prepare("UPDATE users SET student_verified = ?, student_verification_status = ? WHERE id = ?");
        $stmt->execute([$verified, $status, $userId]);

        $this->sendJSON(["status" => "success", "message" => "Student verification $action" . "d successfully."]);
    }

    // --- FLIGHT MANAGEMENT ---
    public function addFlight() {
        $this->auth->requireAdmin();
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->flight_number) || empty($data->origin) || empty($data->destination)) {
            $this->sendJSON(["status" => "error", "message" => "Missing flight data"], 400);
        }

        $total_seats = (int)($data->economy_seats ?? 0) + (int)($data->business_seats ?? 0) + (int)($data->first_class_seats ?? 0);

        $stmt = $this->conn->prepare("
            INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, base_price, economy_seats_total, economy_seats_avail, business_seats_total, business_seats_avail, first_class_seats_total, first_class_seats_avail, total_seats, available_seats)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data->flight_number,
            $data->origin,
            $data->destination,
            $data->departure_time,
            $data->arrival_time,
            $data->base_price,
            $data->economy_seats, $data->economy_seats,
            $data->business_seats, $data->business_seats,
            $data->first_class_seats, $data->first_class_seats,
            $total_seats, $total_seats
        ]);

        $flightId = $this->conn->lastInsertId();
        
        // Auto-generate seat map
        $this->generateSeats($flightId, $data->economy_seats, $data->business_seats, $data->first_class_seats);

        $this->sendJSON(["status" => "success", "message" => "Flight added successfully"]);
    }

    private function generateSeats($flightId, $eco, $bus, $first) {
        $rows = ['A', 'B', 'C', 'D', 'E', 'F'];
        $currentRow = 1;

        // First Class (2 seats per row)
        for ($i = 0; $i < ceil($first/2); $i++) {
            foreach (['A', 'F'] as $l) {
                if ($first-- > 0) $this->addSeat($flightId, $l . $currentRow, 'First Class');
            }
            $currentRow++;
        }

        // Business Class (4 seats per row)
        for ($i = 0; $i < ceil($bus/4); $i++) {
            foreach (['A', 'C', 'D', 'F'] as $l) {
                if ($bus-- > 0) $this->addSeat($flightId, $l . $currentRow, 'Business Class');
            }
            $currentRow++;
        }

        // Economy Class (6 seats per row)
        for ($i = 0; $i < ceil($eco/6); $i++) {
            foreach ($rows as $l) {
                if ($eco-- > 0) $this->addSeat($flightId, $l . $currentRow, 'Economy Class');
            }
            $currentRow++;
        }
    }

    private function addSeat($fId, $num, $class) {
        $this->conn->prepare("INSERT INTO seats (flight_id, seat_number, class) VALUES (?, ?, ?)")->execute([$fId, $num, $class]);
    }

    public function deleteFlight() {
        $this->auth->requireAdmin();
        $data = json_decode(file_get_contents("php://input"));
        $id = $data->flight_id ?? null;

        if (!$id) $this->sendJSON(["status" => "error", "message" => "flight_id required"], 400);

        $stmt = $this->conn->prepare("DELETE FROM flights WHERE flight_id = ?");
        $stmt->execute([$id]);

        $this->sendJSON(["status" => "success", "message" => "Flight deleted"]);
    }

    // --- USER MANAGEMENT ---
    public function getUsers() {
        $this->auth->requireAdmin();
        $stmt = $this->conn->query("SELECT id, name, email, role, user_type, is_verified, created_at FROM users WHERE role != 'admin'");
        $this->sendJSON(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    public function getAllBookings() {
        $this->auth->requireAdmin();
        $stmt = $this->conn->query("
            SELECT b.*, u.name as passenger_name, f.flight_number, f.origin, f.destination
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN flights f ON b.flight_id = f.flight_id
            ORDER BY b.booking_date DESC
        ");
        $this->sendJSON(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }
}