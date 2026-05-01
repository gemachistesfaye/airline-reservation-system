<?php
ob_start(); // Start output buffering to catch any accidental output
require_once __DIR__ . '/vendor/autoload.php';

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");

// Handle OPTIONS request for CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header("Content-Type: application/json");

// Suppress HTML error output to prevent JSON corruption
ini_set('display_errors', 0);
error_reporting(0);

try {
    // Check for query param routing fallback
    if (isset($_GET['route'])) {
        $route = "/" . $_GET['route'];
    }
    
    // Load routes
    require_once "routes/api.php";
} catch (Throwable $e) {
    ob_clean(); // Clear any buffer before sending error JSON
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Critical Server Error",
        "details" => $e->getMessage()
    ]);
    exit;
}