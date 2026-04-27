<?php
require_once __DIR__ . '/vendor/autoload.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

// Suppress HTML error output to prevent JSON corruption
ini_set('display_errors', 0);
error_reporting(0);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Load routes
    require_once "routes/api.php";
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Critical Server Error",
        "details" => $e->getMessage()
    ]);
}