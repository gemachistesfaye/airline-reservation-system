<?php

require_once "config/Database.php";
require_once "controllers/AuthController.php";
require_once "controllers/FlightController.php";
require_once "controllers/BookingController.php";
require_once "controllers/AdminController.php";
require_once "controllers/PaymentController.php";
require_once "controllers/SeatController.php";

$db = new Database();
$conn = $db->connect();

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

$base = "/airline-reservation-system/backend";
$route = str_replace($base, "", $uri);

// =========================
// ROUTING LOGIC
// =========================

// Auth
if ($route === "/register" && $method === "POST") (new AuthController($conn))->register();
if ($route === "/login" && $method === "POST") (new AuthController($conn))->login();
if ($route === "/verify-email" && $method === "GET") (new AuthController($conn))->verifyEmail();
if ($route === "/forgot-password" && $method === "POST") (new AuthController($conn))->forgotPassword();
if ($route === "/reset-password" && $method === "POST") (new AuthController($conn))->resetPassword();
if ($route === "/change-password" && $method === "POST") (new AuthController($conn))->changePassword();

// Profile
if ($route === "/profile" && $method === "GET") (new AuthController($conn))->getUserProfile();
if ($route === "/profile" && $method === "POST") (new AuthController($conn))->updateUserProfile();

// Flights
if ($route === "/flights" && $method === "GET") (new FlightController($conn))->getAllFlights();
if (preg_match('/^\/flights\/(\d+)$/', $route, $m) && $method === "GET") (new FlightController($conn))->getFlight($m[1]);

// Seats
if ($route === "/seats" && $method === "GET") (new SeatController($conn))->getSeatsByFlight();

// Bookings
if ($route === "/book" && $method === "POST") (new BookingController($conn))->bookFlight();
if ($route === "/my-bookings" && $method === "GET") (new BookingController($conn))->getBookings();
if (preg_match('/^\/cancel-booking\/(\d+)$/', $route, $m) && $method === "DELETE") (new BookingController($conn))->cancelBooking($m[1]);
if (preg_match('/^\/process-payment\/(\d+)$/', $route, $m) && $method === "POST") (new PaymentController($conn))->processPayment($m[1]);

// Admin
if ($route === "/admin/stats" && $method === "GET") (new AdminController($conn))->getStats();
if ($route === "/admin/bookings" && $method === "GET") (new AdminController($conn))->getAllBookings();
if ($route === "/admin/users" && $method === "GET") (new AdminController($conn))->getUsers();
if ($route === "/admin/student-verifications" && $method === "GET") (new AdminController($conn))->getStudentVerifications();
if (preg_match('/^\/admin\/student-verifications\/(\d+)$/', $route, $m) && $method === "POST") (new AdminController($conn))->reviewStudentVerification($m[1]);
if ($route === "/admin/flights" && $method === "POST") (new AdminController($conn))->addFlight();
if ($route === "/admin/flights" && $method === "DELETE") (new AdminController($conn))->deleteFlight();

// Fallback
http_response_code(404);
echo json_encode(["status" => "error", "message" => "Endpoint not found: $route"]);