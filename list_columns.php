<?php
require_once "backend/config/Database.php";
$db = new Database();
$conn = $db->connect();
$stmt = $conn->query("DESCRIBE users");
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo $row['Field'] . "\n";
}
?>
