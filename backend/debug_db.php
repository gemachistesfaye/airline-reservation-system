<?php
require_once "config/Database.php";
$db = new Database();
$conn = $db->connect();

$stmt = $conn->query("DESCRIBE users");
$res = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach($res as $r) {
    echo $r['Field'] . " - " . $r['Type'] . "\n";
}
