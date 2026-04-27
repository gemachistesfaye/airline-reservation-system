<?php
require_once "config/database.php";
$db = new Database();
$conn = $db->connect();
$conn->exec("UPDATE passengers SET is_verified = 1 WHERE email = 'gemachistesfaye36@gmail.com'");
echo "User gemachistesfaye36@gmail.com verified successfully!\n";
