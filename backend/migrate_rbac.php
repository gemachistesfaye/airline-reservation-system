<?php
require_once "config/database.php";
$db = new Database();
$conn = $db->connect();

try {
    // 1. Rename passengers to users (if not already done)
    try { $conn->exec("RENAME TABLE passengers TO users"); echo "Table renamed to users.\n"; } catch(Exception $e){}

    // 2. Add role column (if not already done)
    try { $conn->exec("ALTER TABLE users ADD COLUMN role ENUM('admin', 'user') DEFAULT 'user' AFTER password"); echo "Role column added.\n"; } catch(Exception $e){}

    // 3. Migrate existing admin (using passenger_id as reference)
    $stmt = $conn->query("SELECT * FROM admins");
    $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($admins as $admin) {
        $check = $conn->prepare("SELECT passenger_id FROM users WHERE email = ?");
        $check->execute([$admin['email']]);
        if ($check->rowCount() == 0) {
            $ins = $conn->prepare("INSERT INTO users (first_name, last_name, username, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?, 'admin', 1)");
            $ins->execute([$admin['username'], 'Admin', $admin['username'], $admin['email'], $admin['password']]);
            echo "Admin {$admin['email']} migrated.\n";
        }
    }

    // 4. Drop old admins table
    try { $conn->exec("DROP TABLE admins"); echo "Old admins table removed.\n"; } catch(Exception $e){}

    // 5. Update foreign keys in other tables
    try { $conn->exec("ALTER TABLE bookings CHANGE passenger_id user_id INT(11)"); echo "Bookings table updated.\n"; } catch(Exception $e){}

    echo "Migration completed successfully!\n";

} catch (Exception $e) {
    echo "Migration error: " . $e->getMessage() . "\n";
}
