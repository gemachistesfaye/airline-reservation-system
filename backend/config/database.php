<?php
require_once __DIR__ . "/config.php";

class Database {
    public function connect() {
        try {
            $conn = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
                DB_USER,
                DB_PASS
            );
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $conn;
        } catch (PDOException $e) {
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Database connection failed",
                "details" => $e->getMessage()
            ]);
            exit;
        }
    }
}