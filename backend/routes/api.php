<?php

require_once "config/Database.php";
require_once "controllers/AuthController.php";
require_once "controllers/FlightController.php";
require_once "controllers/BookingController.php";

$db = new Database();
$conn = $db->connect();

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

$base = "/airline-reservation-system/backend";
$route = str_replace($base, "", $uri);

// =========================
// AUTH ROUTES
// =========================
if ($route === "/register" && $method === "POST") {
    (new AuthController($conn))->register();
    exit;
}

if ($route === "/login" && $method === "POST") {
    (new AuthController($conn))->login();
    exit;
}

if ($route === "/verify-email" && $method === "GET") {
    (new AuthController($conn))->verifyEmail();
    exit;
}

if ($route === "/forgot-password" && $method === "POST") {
    (new AuthController($conn))->forgotPassword();
    exit;
}

if ($route === "/reset-password" && $method === "POST") {
    (new AuthController($conn))->resetPassword();
    exit;
}

if ($route === "/change-password" && $method === "POST") {
    (new AuthController($conn))->changePassword();
    exit;
}

// =========================
// PROFILE ROUTES
// =========================
if ($route === "/profile" && $method === "GET") {
    (new AuthController($conn))->getUserProfile();
    exit;
}

if ($route === "/profile" && $method === "POST") {
    (new AuthController($conn))->updateUserProfile();
    exit;
}

// =========================
// FLIGHT ROUTES
// =========================
if ($route === "/flights" && $method === "GET") {
    (new FlightController($conn))->getAllFlights();
    exit;
}

if (strpos($route, "/flights/") === 0 && $method === "GET") {
    $parts = explode("/", $route);
    $flight_id = end($parts);
    (new FlightController($conn))->getFlight($flight_id);
    exit;
}

if ($route === "/flight" && $method === "GET") {
    (new FlightController($conn))->getFlight();
    exit;
}

// =========================
// BOOKING ROUTES
// =========================
if ($route === "/book" && $method === "POST") {
    (new BookingController($conn))->bookFlight();
    exit;
}

if ($route === "/cancel" && $method === "POST") {
    (new BookingController($conn))->cancelBooking();
    exit;
}

if (strpos($route, "/cancel-booking/") === 0 && $method === "DELETE") {
    $parts = explode("/", $route);
    $booking_id = end($parts);
    (new BookingController($conn))->cancelBooking($booking_id);
    exit;
}

if ($route === "/my-bookings" && $method === "GET") {
    (new BookingController($conn))->getBookings();
    exit;
}

// =========================
// ADMIN ROUTES
// =========================
require_once "controllers/AdminController.php";
if ($route === "/admin/flights" && $method === "POST") {
    (new AdminController($conn))->addFlight();
    exit;
}
if (strpos($route, "/admin/flights/") === 0 && $method === "PUT") {
    $parts = explode("/", $route);
    $flight_id = end($parts);
    (new AdminController($conn))->updateFlight($flight_id);
    exit;
}
if ($route === "/admin/flights" && $method === "DELETE") {
    (new AdminController($conn))->deleteFlight();
    exit;
}
if ($route === "/admin/bookings" && $method === "GET") {
    (new AdminController($conn))->getAllBookings();
    exit;
}
if ($route === "/admin/stats" && $method === "GET") {
    (new AdminController($conn))->stats();
    exit;
}
if ($route === "/admin/analytics" && $method === "GET") {
    (new AdminController($conn))->analytics();
    exit;
}
if ($route === "/admin/users" && $method === "GET") {
    (new AdminController($conn))->getAllUsers();
    exit;
}
if ($route === "/admin/users/toggle" && $method === "POST") {
    (new AdminController($conn))->toggleUserStatus();
    exit;
}

// =========================
// SEAT ROUTES
// =========================
require_once "controllers/SeatController.php";
if ($route === "/seats" && $method === "GET") {
    (new SeatController($conn))->getSeatsByFlight();
    exit;
}

// DEFAULT
echo json_encode([
    "status" => "error",
    "message" => "Route not found",
    "path" => $route
]);