<?php
require_once "backend/config/Database.php";
$db = new Database();
$conn = $db->connect();
echo "PHP Time: " . date('Y-m-d H:i:s') . "\n";
$stmt = $conn->query("SELECT CURRENT_TIMESTAMP");
echo "DB Time:  " . $stmt->fetchColumn() . "\n";
?>
