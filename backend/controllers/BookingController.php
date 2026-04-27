<?php

require_once __DIR__ . "/../middleware/AuthMiddleware.php";

class BookingController {

    private $conn;
    private $auth;

    public function __construct($conn) {
        $this->conn = $conn;
        $this->auth = new AuthMiddleware();
    }

    // =====================
    // BOOK FLIGHT (SECURE + SAFE)
    // =====================
    public function bookFlight() {

        $user = $this->auth->requireUser(); // STRICT RBAC: Only 'user' role allowed
        
        $data = json_decode(file_get_contents("php://input"));

        if (!$data || empty($data->flight_id) || empty($data->seat_number)) {
            echo json_encode([
                "status" => "error",
                "message" => "flight_id and seat_number required"
            ]);
            return;
        }

        // =====================
        // CHECK FLIGHT EXISTS
        // =====================
        $stmt = $this->conn->prepare("
            SELECT available_seats 
            FROM flights 
            WHERE flight_id = ?
        ");
        $stmt->execute([$data->flight_id]);

        $flight = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$flight) {
            echo json_encode([
                "status" => "error",
                "message" => "Flight not found"
            ]);
            return;
        }

        if ($flight['available_seats'] <= 0) {
            echo json_encode([
                "status" => "error",
                "message" => "No seats available"
            ]);
            return;
        }

        // =====================
        // CHECK IF SEAT ALREADY BOOKED
        // =====================
        $checkSeat = $this->conn->prepare("
            SELECT booking_id 
            FROM bookings 
            WHERE flight_id = ? AND seat_number = ?
        ");
        $checkSeat->execute([
            $data->flight_id,
            $data->seat_number
        ]);

        if ($checkSeat->rowCount() > 0) {
            echo json_encode([
                "status" => "error",
                "message" => "Seat already booked"
            ]);
            return;
        }

        // =====================
        // CHECK SEAT STATUS TABLE (IMPORTANT FIX)
        // =====================
        $seatCheck = $this->conn->prepare("
            SELECT availability_status 
            FROM seats 
            WHERE flight_id = ? AND seat_number = ?
        ");
        $seatCheck->execute([
            $data->flight_id,
            $data->seat_number
        ]);

        $seat = $seatCheck->fetch(PDO::FETCH_ASSOC);

        if ($seat && $seat['availability_status'] === 'booked') {
            echo json_encode([
                "status" => "error",
                "message" => "Seat already booked (seat table)"
            ]);
            return;
        }

        // =====================
        // START TRANSACTION (WITH CONCURRENCY PROTECTION)
        // =====================
        $this->conn->beginTransaction();

        try {
            // 0. PREVENT MULTIPLE BOOKINGS BY SAME USER ON SAME FLIGHT
            $dup = $this->conn->prepare("SELECT booking_id FROM bookings WHERE user_id = ? AND flight_id = ? AND status = 'Confirmed'");
            $dup->execute([$user->id, $data->flight_id]);
            if ($dup->rowCount() > 0) {
                $this->conn->rollBack();
                echo json_encode(["status" => "error", "message" => "You already have a confirmed booking for this flight."]);
                return;
            }

            // 1. LOCK FLIGHT RECORD
            $stmt = $this->conn->prepare("SELECT available_seats FROM flights WHERE flight_id = ? FOR UPDATE");
            $stmt->execute([$data->flight_id]);
            $flight = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$flight || $flight['available_seats'] <= 0) {
                $this->conn->rollBack();
                echo json_encode(["status" => "error", "message" => "Flight full or not found"]);
                return;
            }

            // LOCK SEAT RECORD
            $seatCheck = $this->conn->prepare("SELECT availability_status FROM seats WHERE flight_id = ? AND seat_number = ? FOR UPDATE");
            $seatCheck->execute([$data->flight_id, $data->seat_number]);
            $seat = $seatCheck->fetch(PDO::FETCH_ASSOC);

            if (!$seat || $seat['availability_status'] === 'booked') {
                $this->conn->rollBack();
                echo json_encode(["status" => "error", "message" => "Seat no longer available"]);
                return;
            }

            // GENERATE TICKET NUMBER
            $ticket_number = 'TKT-' . strtoupper(substr(uniqid(), -6)) . rand(100, 999);

            // INSERT BOOKING
            $insert = $this->conn->prepare("
                INSERT INTO bookings (user_id, flight_id, seat_number, status, ticket_number)
                VALUES (?, ?, ?, 'Confirmed', ?)
            ");
            $insert->execute([$user->id, $data->flight_id, $data->seat_number, $ticket_number]);

            // UPDATE FLIGHT SEATS
            $updateFlight = $this->conn->prepare("UPDATE flights SET available_seats = available_seats - 1 WHERE flight_id = ?");
            $updateFlight->execute([$data->flight_id]);

            // UPDATE SEAT STATUS
            $updateSeat = $this->conn->prepare("UPDATE seats SET availability_status = 'booked' WHERE flight_id = ? AND seat_number = ?");
            $updateSeat->execute([$data->flight_id, $data->seat_number]);

            $this->conn->commit();
            echo json_encode(["status" => "success", "message" => "Booking successful", "ticket" => $ticket_number]);

        } catch (Exception $e) {
            $this->conn->rollBack();
            echo json_encode(["status" => "error", "message" => "Booking failed: " . $e->getMessage()]);
        }
    }

    // =====================
    // GET USER BOOKINGS
    // =====================
    public function getBookings() {

        $user = $this->auth->verify();

        $stmt = $this->conn->prepare("
            SELECT 
                b.booking_id,
                f.flight_number,
                f.origin,
                f.destination,
                f.departure_time,
                f.status as flight_status,
                b.seat_number,
                b.booking_date,
                b.status,
                b.ticket_number
            FROM bookings b
            JOIN flights f ON b.flight_id = f.flight_id
            WHERE b.user_id = ?
            ORDER BY b.booking_date DESC
        ");

        $stmt->execute([$user->id]);

        echo json_encode([
            "status" => "success",
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    }

    // =====================
    // CANCEL BOOKING
    // =====================
    public function cancelBooking($id = null) {

        $user = $this->auth->verify();
        $booking_id = $id;

        if (!$booking_id) {
            $data = json_decode(file_get_contents("php://input"));
            $booking_id = $data->booking_id ?? null;
        }

        if (!$booking_id) {
            echo json_encode(["status" => "error", "message" => "booking_id required"]);
            return;
        }

        // Verify this booking belongs to the user and is confirmed
        $check = $this->conn->prepare("
            SELECT flight_id, seat_number FROM bookings
            WHERE booking_id = ? AND user_id = ? AND status = 'Confirmed'
        ");
        $check->execute([$booking_id, $user->id]);
        $booking = $check->fetch(PDO::FETCH_ASSOC);

        if (!$booking) {
            echo json_encode(["status" => "error", "message" => "Booking not found or cannot be cancelled"]);
            return;
        }

        $this->conn->beginTransaction();
        try {
            // Mark booking as cancelled
            $upd = $this->conn->prepare("UPDATE bookings SET status = 'Cancelled' WHERE booking_id = ?");
            $upd->execute([$booking_id]);

            // Restore flight seat count
            $upd2 = $this->conn->prepare("UPDATE flights SET available_seats = available_seats + 1 WHERE flight_id = ?");
            $upd2->execute([$booking['flight_id']]);

            // Restore seat availability
            $upd3 = $this->conn->prepare("
                UPDATE seats SET availability_status = 'available'
                WHERE flight_id = ? AND seat_number = ?
            ");
            $upd3->execute([$booking['flight_id'], $booking['seat_number']]);

            $this->conn->commit();
            echo json_encode(["status" => "success", "message" => "Booking cancelled successfully"]);
        } catch (Exception $e) {
            $this->conn->rollBack();
            echo json_encode(["status" => "error", "message" => "Cancellation failed: " . $e->getMessage()]);
        }
    }
}