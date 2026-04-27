<?php
require_once "config/database.php";
$db = new Database();
$conn = $db->connect();

$email = "Admin@gmail.com";
$password = password_hash("Admin1234", PASSWORD_BCRYPT);
$username = "SuperAdmin";

// Check if any admin exists, if so update the first one, otherwise insert
$check = $conn->query("SELECT admin_id FROM admins LIMIT 1");
$admin = $check->fetch();

if ($admin) {
    $stmt = $conn->prepare("UPDATE admins SET email = ?, password = ?, username = ? WHERE admin_id = ?");
    $stmt->execute([$email, $password, $username, $admin['admin_id']]);
    echo "Admin updated successfully!\n";
} else {
    $stmt = $conn->prepare("INSERT INTO admins (username, email, password) VALUES (?, ?, ?)");
    $stmt->execute([$username, $email, $password]);
    echo "New Admin created successfully!\n";
}
