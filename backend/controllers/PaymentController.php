<?php

require_once __DIR__ . "/../middleware/AuthMiddleware.php";

class PaymentController {

    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    private function sendJSON($data, $statusCode = 200) {
        header('Content-Type: application/json');
        http_response_code($statusCode);
        ob_clean();
        echo json_encode($data);
        exit;
    }

    public function processPayment($booking_id) {
        try {
            $this->conn->beginTransaction();

            $stmt = $this->conn->prepare("SELECT status FROM bookings WHERE booking_id = ? FOR UPDATE");
            $stmt->execute([$booking_id]);
            $booking = $stmt->fetch();

            if (!$booking) {
                $this->conn->rollBack();
                $this->sendJSON(["status" => "error", "message" => "Booking not found"], 404);
            }

            if ($booking['status'] === 'Confirmed') {
                $this->conn->rollBack();
                $this->sendJSON(["status" => "success", "message" => "Already confirmed."]);
            }

            $update = $this->conn->prepare("UPDATE bookings SET status = 'Confirmed', payment_status = 'paid' WHERE booking_id = ?");
            $update->execute([$booking_id]);

            $this->conn->commit();
            $this->sendJSON(["status" => "success", "message" => "Payment successful! Your ticket is now confirmed."]);

        } catch (Exception $e) {
            $this->conn->rollBack();
            $this->sendJSON(["status" => "error", "message" => "Payment failed: " . $e->getMessage()], 500);
        }
    }
}
