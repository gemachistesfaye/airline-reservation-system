<?php
require 'backend/config/Database.php';
$db = new Database();
$conn = $db->connect();

$stmt = $conn->query('SHOW TABLES');
print_r($stmt->fetchAll(PDO::FETCH_COLUMN));

$stmt = $conn->query('DESCRIBE users');
if ($stmt) print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
