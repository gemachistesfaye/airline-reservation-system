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

    private function sendJSON($data, $statusCode = 200) {
        header('Content-Type: application/json');
        http_response_code($statusCode);
        ob_clean();
        echo json_encode($data);
        exit;
    }

    public function bookFlight() {
        $user = $this->auth->requireUser(); 
        $data = json_decode(file_get_contents("php://input"));

        if (!$data || empty($data->flight_id) || empty($data->seat_number) || empty($data->seat_class)) {
            $this->sendJSON(["status" => "error", "message" => "Flight, Seat, and Class are required"], 400);
        }

        $seat_class = $data->seat_class;
        $classMap = [
            'Economy Class' => 'economy_seats_avail',
            'Business Class' => 'business_seats_avail',
            'First Class' => 'first_class_seats_avail'
        ];

        if (!array_key_exists($seat_class, $classMap)) {
            $this->sendJSON(["status" => "error", "message" => "Invalid seat class selected"], 400);
        }

        $availCol = $classMap[$seat_class];

        $this->conn->beginTransaction();
        try {
            // 1. Check availability
            $stmt = $this->conn->prepare("SELECT $availCol, base_price, flight_number, origin, destination FROM flights WHERE flight_id = ? FOR UPDATE");
            $stmt->execute([$data->flight_id]);
            $flight = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$flight || $flight[$availCol] <= 0) {
                $this->conn->rollBack();
                $this->sendJSON(["status" => "error", "message" => "No seats available in $seat_class"], 400);
            }

            // 2. Check seat
            $seatStmt = $this->conn->prepare("SELECT availability_status FROM seats WHERE flight_id = ? AND seat_number = ? FOR UPDATE");
            $seatStmt->execute([$data->flight_id, $data->seat_number]);
            if ($seatStmt->fetchColumn() === 'booked') {
                $this->conn->rollBack();
                $this->sendJSON(["status" => "error", "message" => "Seat already taken"], 400);
            }

            // 3. Pricing & Student Discount (20%)
            $multipliers = ['Economy Class' => 1.0, 'Business Class' => 2.5, 'First Class' => 5.0];
            $base_fare = (float)$flight['base_price'] * $multipliers[$seat_class];
            
            $discount = 0;
            $userStmt = $this->conn->prepare("SELECT is_student, student_verified FROM users WHERE id = ?");
            $userStmt->execute([$user->id]);
            $userData = $userStmt->fetch();
            if ($userData['is_student'] && $userData['student_verified']) {
                $discount = $base_fare * 0.20;
            }
            $total = $base_fare - $discount;

            $ticket = 'AERO-' . strtoupper(substr(uniqid(), -4)) . rand(10, 99);

            // 4. Create Booking
            $ins = $this->conn->prepare("
                INSERT INTO bookings (user_id, flight_id, seat_number, seat_class, base_price, discount_amount, total_price, status, payment_status, ticket_number)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending Payment', 'pending', ?)
            ");
            $ins->execute([$user->id, $data->flight_id, $data->seat_number, $seat_class, $base_fare, $discount, $total, $ticket]);
            $bookingId = $this->conn->lastInsertId();

            // 5. Update inventory
            $this->conn->prepare("UPDATE flights SET $availCol = $availCol - 1, available_seats = available_seats - 1 WHERE flight_id = ?")->execute([$data->flight_id]);
            $this->conn->prepare("UPDATE seats SET availability_status = 'booked' WHERE flight_id = ? AND seat_number = ?")->execute([$data->flight_id, $data->seat_number]);

            $this->conn->commit();

            // 6. Notify
            $emailSvc = new EmailService();
            $emailSvc->sendPaymentEmail($user->email, $user->name, [
                'booking_id' => $bookingId,
                'flight_number' => $flight['flight_number'],
                'origin' => $flight['origin'],
                'destination' => $flight['destination'],
                'seat_class' => $seat_class,
                'seat_number' => $data->seat_number,
                'total_price' => number_format($total, 2),
                'ticket_number' => $ticket
            ]);

            $this->sendJSON(["status" => "success", "message" => "Booking created! Check your email for payment link.", "booking_id" => $bookingId]);
        } catch (Exception $e) {
            $this->conn->rollBack();
            $this->sendJSON(["status" => "error", "message" => "Booking failed: " . $e->getMessage()], 500);
        }
    }

    public function processPayment($id) {
        // Simple simulation: status = Pending Payment -> Confirmed
        $stmt = $this->conn->prepare("UPDATE bookings SET status = 'Confirmed', payment_status = 'paid' WHERE booking_id = ?");
        $stmt->execute([$id]);
        $this->sendJSON(["status" => "success", "message" => "Payment successful! Your ticket is now confirmed."]);
    }

    public function getBookings() {
        $user = $this->auth->verify();
        $stmt = $this->conn->prepare("
            SELECT b.*, f.flight_number, f.origin, f.destination, f.departure_time
            FROM bookings b
            JOIN flights f ON b.flight_id = f.flight_id
            WHERE b.user_id = ?
            ORDER BY b.booking_date DESC
        ");
        $stmt->execute([$user->id]);
        $this->sendJSON(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    public function cancelBooking($id) {
        $user = $this->auth->verify();
        
        $this->conn->beginTransaction();
        try {
            $stmt = $this->conn->prepare("SELECT flight_id, seat_number, seat_class, status FROM bookings WHERE booking_id = ? AND user_id = ? FOR UPDATE");
            $stmt->execute([$id, $user->id]);
            $b = $stmt->fetch();

            if (!$b || $b['status'] === 'Cancelled') {
                $this->conn->rollBack();
                $this->sendJSON(["status" => "error", "message" => "Booking not found or already cancelled"], 404);
            }

            $classMap = ['Economy Class' => 'economy_seats_avail', 'Business Class' => 'business_seats_avail', 'First Class' => 'first_class_seats_avail'];
            $col = $classMap[$b['seat_class']];

            $this->conn->prepare("UPDATE bookings SET status = 'Cancelled' WHERE booking_id = ?")->execute([$id]);
            $this->conn->prepare("UPDATE flights SET $col = $col + 1, available_seats = available_seats + 1 WHERE flight_id = ?")->execute([$b['flight_id']]);
            $this->conn->prepare("UPDATE seats SET availability_status = 'available' WHERE flight_id = ? AND seat_number = ?")->execute([$b['flight_id'], $b['seat_number']]);

            $this->conn->commit();
            $this->sendJSON(["status" => "success", "message" => "Booking cancelled successfully."]);
        } catch (Exception $e) {
            $this->conn->rollBack();
            $this->sendJSON(["status" => "error", "message" => "Cancellation failed"], 500);
        }
    }
}