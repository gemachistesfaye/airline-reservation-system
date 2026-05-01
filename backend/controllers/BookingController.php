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

        // Standardize class names to match DB Enum
        $classMap = [
            'Economy Class' => 'economy_seats_avail',
            'Business Class' => 'business_seats_avail',
            'First Class' => 'first_class_seats_avail'
        ];

        // Handle frontend variations if any
        $seat_class = $data->seat_class;
        if ($seat_class === 'Economy') $seat_class = 'Economy Class';
        if ($seat_class === 'Business') $seat_class = 'Business Class';

        if (!array_key_exists($seat_class, $classMap)) {
            echo json_encode(["status" => "error", "message" => "Invalid seat class selected: " . $seat_class]);
            return;
        }

        $availCol = $classMap[$seat_class];

        $this->conn->beginTransaction();

        try {
            // 1. LOCK FLIGHT RECORD & GET BASE PRICE
            $stmt = $this->conn->prepare("SELECT $availCol, flight_number, origin, destination, base_price FROM flights WHERE flight_id = ? FOR UPDATE");
            $stmt->execute([$data->flight_id]);
            $flight = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$flight || $flight[$availCol] <= 0) {
                $this->conn->rollBack();
                echo json_encode(["status" => "error", "message" => "No seats available in " . $seat_class]);
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

            if ($seat['class'] !== $seat_class) {
                $this->conn->rollBack();
                echo json_encode(["status" => "error", "message" => "Seat " . $data->seat_number . " is not " . $seat_class . " (it is " . $seat['class'] . ")"]);
                return;
            }

            // 3. CALCULATE PRICE & DISCOUNT
            $base_price = (float)$flight['base_price'];
            // Price multipliers for classes
            $multipliers = [
                'Economy Class' => 1.0,
                'Business Class' => 2.5,
                'First Class' => 5.0
            ];
            $final_base = $base_price * $multipliers[$seat_class];
            
            $discount = 0.00;
            $student_status = "not_student";
            $studentStmt = $this->conn->prepare("SELECT is_student, student_verified, student_verification_status FROM users WHERE id = ?");
            $studentStmt->execute([$user->id]);
            $studentData = $studentStmt->fetch(PDO::FETCH_ASSOC);
            $isStudent = (int)($studentData['is_student'] ?? 0) === 1;
            $studentVerified = (int)($studentData['student_verified'] ?? 0) === 1;
            $verificationStatus = $studentData['student_verification_status'] ?? 'none';
            if ($isStudent && $studentVerified) {
                $discount = $final_base * 0.20;
                $student_status = "verified";
            } elseif ($isStudent) {
                $student_status = $verificationStatus === 'rejected' ? 'rejected' : 'pending';
            }
            $total_price = $final_base - $discount;

            // 4. GENERATE TICKET & INSERT BOOKING
            $ticket_number = 'AERO-' . strtoupper(substr(uniqid(), -4)) . rand(10, 99);
            
            $insert = $this->conn->prepare("
                INSERT INTO bookings (user_id, flight_id, seat_number, seat_class, base_price, discount_amount, total_price, status, payment_status, ticket_number)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending Payment', 'pending', ?)
            ");
            $insert->execute([
                $user->id, 
                $data->flight_id, 
                $data->seat_number, 
                $seat_class, 
                $final_base, 
                $discount, 
                $total_price, 
                $ticket_number
            ]);
            $booking_id = $this->conn->lastInsertId();

            // 5. UPDATE CLASS SPECIFIC AVAILABILITY
            $updateFlight = $this->conn->prepare("UPDATE flights SET $availCol = $availCol - 1, available_seats = available_seats - 1 WHERE flight_id = ?");
            $updateFlight->execute([$data->flight_id]);

            // 6. UPDATE SEAT STATUS
            $updateSeat = $this->conn->prepare("UPDATE seats SET availability_status = 'booked' WHERE flight_id = ? AND seat_number = ?");
            $updateSeat->execute([$data->flight_id, $data->seat_number]);

            $this->conn->commit();

            // 7. SEND PAYMENT EMAIL
            $emailService = new EmailService();
            $emailService->sendPaymentEmail($user->email, $user->name, [
                'booking_id' => $booking_id,
                'flight_number' => $flight['flight_number'],
                'origin' => $flight['origin'],
                'destination' => $flight['destination'],
                'seat_class' => $seat_class,
                'seat_number' => $data->seat_number,
                'total_price' => number_format($total_price, 2),
                'ticket_number' => $ticket_number
            ]);

            echo json_encode([
                "status" => "success", 
                "message" => "Booking created! Please check your email for the payment link.",
                "booking_id" => $booking_id,
                "total_price" => $total_price,
                "discount_applied" => ($discount > 0),
                "pricing" => [
                    "original_price" => round($final_base, 2),
                    "discount_amount" => round($discount, 2),
                    "final_price" => round($total_price, 2)
                ],
                "student_status" => $student_status
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
                b.seat_number, b.seat_class, b.booking_date, b.status, b.payment_status, b.ticket_number,
                b.total_price
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
            SELECT
                b.flight_id,
                b.seat_number,
                b.seat_class,
                s.class AS seat_table_class
            FROM bookings b
            LEFT JOIN seats s ON s.flight_id = b.flight_id AND TRIM(UPPER(s.seat_number)) = TRIM(UPPER(b.seat_number))
            WHERE b.booking_id = ? AND b.user_id = ? AND b.status != 'Cancelled'
        ");
        $check->execute([$booking_id, $user->id]);
        $booking = $check->fetch(PDO::FETCH_ASSOC);

        if (!$booking) {
            echo json_encode(["status" => "error", "message" => "Booking not found"]);
            return;
        }

        $classMap = [
            'Economy' => 'economy_seats_avail',
            'Economy Class' => 'economy_seats_avail',
            'Business' => 'business_seats_avail',
            'Business Class' => 'business_seats_avail',
            'First Class' => 'first_class_seats_avail'
        ];
        $seatClass = trim((string)($booking['seat_class'] ?? ''));
        if ($seatClass === '') {
            $seatClass = trim((string)($booking['seat_table_class'] ?? ''));
        }
        $availCol = $classMap[$seatClass] ?? null;

        $this->conn->beginTransaction();
        try {
            $this->conn->prepare("UPDATE bookings SET status = 'Cancelled' WHERE booking_id = ?")->execute([$booking_id]);
            if ($availCol) {
                $this->conn->prepare("UPDATE flights SET $availCol = $availCol + 1, available_seats = available_seats + 1 WHERE flight_id = ?")->execute([$booking['flight_id']]);
            } else {
                // Fallback for legacy/dirty rows with missing class value.
                $this->conn->prepare("UPDATE flights SET available_seats = available_seats + 1 WHERE flight_id = ?")->execute([$booking['flight_id']]);
            }
            $this->conn->prepare("UPDATE seats SET availability_status = 'available' WHERE flight_id = ? AND TRIM(UPPER(seat_number)) = TRIM(UPPER(?))")->execute([$booking['flight_id'], $booking['seat_number']]);

            $this->conn->commit();
            if ($availCol) {
                echo json_encode(["status" => "success", "message" => "Booking cancelled"]);
            } else {
                echo json_encode(["status" => "success", "message" => "Booking cancelled (seat class was missing, class counter skipped)"]);
            }
        } catch (Exception $e) {
            $this->conn->rollBack();
            echo json_encode(["status" => "error", "message" => "Cancellation failed: " . $e->getMessage()]);
        }
    }
}