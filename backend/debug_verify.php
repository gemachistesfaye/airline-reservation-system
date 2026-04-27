<?php
require_once "config/database.php";
$db = new Database();
$conn = $db->connect();

$stmt = $conn->query("SELECT email, verification_token FROM passengers WHERE is_verified = 0");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($users)) {
    echo "No unverified users found.\n";
} else {
    echo "UNVERIFIED USERS & LINKS:\n";
    foreach ($users as $u) {
        $link = "http://localhost/airline-reservation-system/backend/verify-email?token=" . $u['verification_token'];
        echo "Email: " . $u['email'] . "\n";
        echo "Link:  " . $link . "\n\n";
    }
}
