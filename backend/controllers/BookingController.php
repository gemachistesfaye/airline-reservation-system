<?php

require_once __DIR__ . "/../middleware/AuthMiddleware.php";
require_once __DIR__ . "/../services/EmailService.php";

class BookingController {

    private $conn;
    private $auth;

    public function __construct($conn) {
        $this->conn = $conn;
        $this->auth = new AuthMiddleware();
    }

    public function bookFlight() {
        $user = $this->auth->requireUser(); 
        $data = json_decode(file_get_contents("php://input"));

        if (!$data || empty($data->flight_id) || empty($data->seat_number) || empty($data->seat_class)) {
            echo json_encode(["status" => "error", "message" => "Flight, Seat, and Class are required"]);
            return;
        }

        $classMap = [
            'Economy' => 'economy_seats_avail',
            'Business' => 'business_seats_avail',
            'First Class' => 'first_class_seats_avail'
        ];

        if (!array_key_exists($data->seat_class, $classMap)) {
            echo json_encode(["status" => "error", "message" => "Invalid seat class selected"]);
            return;
        }

        $availCol = $classMap[$data->seat_class];

        $this->conn->beginTransaction();

        try {
            // 1. LOCK FLIGHT RECORD (CLASS SPECIFIC)
            $stmt = $this->conn->prepare("SELECT $availCol, flight_number, origin, destination FROM flights WHERE flight_id = ? FOR UPDATE");
            $stmt->execute([$data->flight_id]);
            $flight = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$flight || $flight[$availCol] <= 0) {
                $this->conn->rollBack();
                echo json_encode(["status" => "error", "message" => "No seats available in " . $data->seat_class]);
                return;
            }

            // 2. LOCK SEAT RECORD & VERIFY CLASS MATCH
            $seatCheck = $this->conn->prepare("SELECT availability_status, class FROM seats WHERE flight_id = ? AND seat_number = ? FOR UPDATE");
            $seatCheck->execute([$data->flight_id, $data->seat_number]);
            $seat = $seatCheck->fetch(PDO::FETCH_ASSOC);

            if (!$seat || $seat['availability_status'] === 'booked') {
                $this->conn->rollBack();
                echo json_encode(["status" => "error", "message" => "Seat already taken"]);
                return;
            }

            if ($seat['class'] !== $data->seat_class) {
                $this->conn->rollBack();
                echo json_encode(["status" => "error", "message" => "Seat " . $data->seat_number . " is not " . $data->seat_class . " (it is " . $seat['class'] . ")"]);
                return;
            }

            // 3. GENERATE TICKET & INSERT BOOKING (PENDING PAYMENT)
            $ticket_number = 'AERO-' . strtoupper(substr(uniqid(), -4)) . rand(10, 99);
            
            $insert = $this->conn->prepare("
                INSERT INTO bookings (user_id, flight_id, seat_number, seat_class, status, payment_status, ticket_number)
                VALUES (?, ?, ?, ?, 'Pending Payment', 'pending', ?)
            ");
            $insert->execute([$user->id, $data->flight_id, $data->seat_number, $data->seat_class, $ticket_number]);
            $booking_id = $this->conn->lastInsertId();

            // 4. UPDATE CLASS SPECIFIC AVAILABILITY
            $updateFlight = $this->conn->prepare("UPDATE flights SET $availCol = $availCol - 1, available_seats = available_seats - 1 WHERE flight_id = ?");
            $updateFlight->execute([$data->flight_id]);

            // 5. UPDATE SEAT STATUS
            $updateSeat = $this->conn->prepare("UPDATE seats SET availability_status = 'booked' WHERE flight_id = ? AND seat_number = ?");
            $updateSeat->execute([$data->flight_id, $data->seat_number]);

            $this->conn->commit();

            // 6. SEND PAYMENT EMAIL
            $emailService = new EmailService();
            $emailService->sendPaymentEmail($user->email, $user->first_name, [
                'booking_id' => $booking_id,
                'flight_number' => $flight['flight_number'],
                'origin' => $flight['origin'],
                'destination' => $flight['destination'],
                'seat_class' => $data->seat_class,
                'seat_number' => $data->seat_number,
                'ticket_number' => $ticket_number
            ]);

            echo json_encode([
                "status" => "success", 
                "message" => "Booking created! Please check your email for the payment link.",
                "booking_id" => $booking_id
            ]);

        } catch (Exception $e) {
            $this->conn->rollBack();
            echo json_encode(["status" => "error", "message" => "Booking failed: " . $e->getMessage()]);
        }
    }

    public function getBookings() {
        $user = $this->auth->verify();
        $stmt = $this->conn->prepare("
            SELECT 
                b.booking_id, f.flight_number, f.origin, f.destination, f.departure_time,
                b.seat_number, b.seat_class, b.booking_date, b.status, b.payment_status, b.ticket_number
            FROM bookings b
            JOIN flights f ON b.flight_id = f.flight_id
            WHERE b.user_id = ?
            ORDER BY b.booking_date DESC
        ");
        $stmt->execute([$user->id]);
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    public function cancelBooking($id = null) {
        $user = $this->auth->verify();
        $booking_id = $id ?? json_decode(file_get_contents("php://input"))->booking_id ?? null;

        if (!$booking_id) {
            echo json_encode(["status" => "error", "message" => "booking_id required"]);
            return;
        }

        $check = $this->conn->prepare("
            SELECT flight_id, seat_number, seat_class FROM bookings
            WHERE booking_id = ? AND user_id = ? AND status != 'Cancelled'
        ");
        $check->execute([$booking_id, $user->id]);
        $booking = $check->fetch(PDO::FETCH_ASSOC);

        if (!$booking) {
            echo json_encode(["status" => "error", "message" => "Booking not found"]);
            return;
        }

        $classMap = [
            'Economy' => 'economy_seats_avail',
            'Business' => 'business_seats_avail',
            'First Class' => 'first_class_seats_avail'
        ];
        $availCol = $classMap[$booking['seat_class']];

        $this->conn->beginTransaction();
        try {
            $this->conn->prepare("UPDATE bookings SET status = 'Cancelled' WHERE booking_id = ?")->execute([$booking_id]);
            $this->conn->prepare("UPDATE flights SET $availCol = $availCol + 1, available_seats = available_seats + 1 WHERE flight_id = ?")->execute([$booking['flight_id']]);
            $this->conn->prepare("UPDATE seats SET availability_status = 'available' WHERE flight_id = ? AND seat_number = ?")->execute([$booking['flight_id'], $booking['seat_number']]);

            $this->conn->commit();
            echo json_encode(["status" => "success", "message" => "Booking cancelled"]);
        } catch (Exception $e) {
            $this->conn->rollBack();
            echo json_encode(["status" => "error", "message" => "Cancellation failed"]);
        }
    }
}