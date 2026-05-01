<?php
require_once "backend/config/Database.php";
$db = new Database();
$conn = $db->connect();
$stmt = $conn->query("DESCRIBE users");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
