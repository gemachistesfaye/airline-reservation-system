<?php

require_once __DIR__ . "/../middleware/AuthMiddleware.php";

class PaymentController {

    private $conn;
    private $auth;

    public function __construct($conn) {
        $this->conn = $conn;
        $this->auth = new AuthMiddleware();
    }

    public function processPayment($booking_id) {
        // In a real app, we would verify payment with a gateway like Stripe/PayPal here
        
        try {
            $this->conn->beginTransaction();

            // 1. Check if booking exists and is pending
            $stmt = $this->conn->prepare("SELECT status, payment_status FROM bookings WHERE booking_id = ? FOR UPDATE");
            $stmt->execute([$booking_id]);
            $booking = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$booking) {
                $this->conn->rollBack();
                echo json_encode(["status" => "error", "message" => "Booking not found"]);
                return;
            }

            if ($booking['status'] === 'Confirmed') {
                $this->conn->rollBack();
                echo json_encode(["status" => "success", "message" => "Payment already processed"]);
                return;
            }

            // 2. Update status to Confirmed
            $update = $this->conn->prepare("
                UPDATE bookings 
                SET status = 'Confirmed', payment_status = 'paid' 
                WHERE booking_id = ?
            ");
            $update->execute([$booking_id]);

            $this->conn->commit();

            echo json_encode([
                "status" => "success",
                "message" => "Payment successful! Your ticket is now confirmed.",
                "booking_id" => $booking_id
            ]);

        } catch (Exception $e) {
            $this->conn->rollBack();
            echo json_encode(["status" => "error", "message" => "Payment processing failed: " . $e->getMessage()]);
        }
    }
}
