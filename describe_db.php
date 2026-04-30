<?php
require 'backend/config/Database.php';
$db = new Database();
$conn = $db->connect();

$stmt = $conn->query('SHOW TABLES');
print_r($stmt->fetchAll(PDO::FETCH_COLUMN));

$stmt = $conn->query('DESCRIBE flights');
if ($stmt) print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

$stmt = $conn->query('DESCRIBE seats');
if ($stmt) print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

$stmt = $conn->query('DESCRIBE bookings');
if ($stmt) print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
