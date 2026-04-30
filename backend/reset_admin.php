<?php
require_once "config/Database.php";
    $conn = new PDO("mysql:host=localhost;dbname=airline_db", "root", "", [
        PDO::ATTR_TIMEOUT => 5,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

$email = "admin@admin.com";
$password = password_hash("admin123", PASSWORD_BCRYPT);
$name = "System Admin";

try {
    // Check if user exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        // Update existing
        $stmt = $conn->prepare("UPDATE users SET password = ?, role = 'admin', is_verified = 1 WHERE id = ?");
        $stmt->execute([$password, $user['id']]);
        echo "Admin account updated successfully.\n";
    } else {
        // Insert new
        $stmt = $conn->prepare("INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, 'admin', 1)");
        $stmt->execute([$name, $email, $password]);
        echo "Admin account created successfully.\n";
    }
    
    echo "Email: $email\n";
    echo "Password: admin123\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
