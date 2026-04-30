<?php
require_once "config/Database.php";
$db = new Database();
$conn = $db->connect();

$email = "admin@example.com"; // Default target
$stmt = $conn->prepare("UPDATE users SET role = 'admin' WHERE email = ?");
$stmt->execute([$email]);

if ($stmt->rowCount() > 0) {
    echo "User $email is now an admin.\n";
} else {
    // If not found, try to promote the first user
    $stmt = $conn->query("UPDATE users SET role = 'admin' LIMIT 1");
    if ($stmt->rowCount() > 0) {
        echo "The first user in the database has been promoted to admin.\n";
    } else {
        echo "No users found in the database.\n";
    }
}
