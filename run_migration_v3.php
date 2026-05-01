<?php
require_once "backend/config/Database.php";

try {
    $db = new Database();
    $conn = $db->connect();

    // 1. Add required columns to users table
    $columns = [
        "user_type ENUM('regular', 'student') DEFAULT 'regular'",
        "is_student TINYINT(1) DEFAULT 0",
        "student_id_file VARCHAR(255) DEFAULT NULL",
        "passport_file VARCHAR(255) DEFAULT NULL",
        "student_verified TINYINT(1) DEFAULT 0",
        "student_verification_status ENUM('none', 'pending', 'approved', 'rejected') DEFAULT 'none'",
        "is_verified TINYINT(1) DEFAULT 0",
        "verification_token VARCHAR(100) DEFAULT NULL",
        "reset_token VARCHAR(100) DEFAULT NULL",
        "token_expiry DATETIME DEFAULT NULL"
    ];

    foreach ($columns as $col) {
        $colName = explode(' ', trim($col))[0];
        try {
            $conn->exec("ALTER TABLE users ADD COLUMN $col");
            echo "Added column: $colName\n";
        } catch (PDOException $e) {
            if ($e->getCode() == '42S21' || strpos($e->getMessage(), 'Duplicate column name') !== false) {
                echo "Column $colName already exists.\n";
            } else {
                throw $e;
            }
        }
    }

    // 2. Ensure role separation columns exist
    $conn->exec("ALTER TABLE users MODIFY COLUMN role ENUM('user', 'admin') DEFAULT 'user'");
    echo "Ensured user roles are correct.\n";

    // 3. Clean up system (Delete bookings first due to FK)
    $conn->exec("SET FOREIGN_KEY_CHECKS = 0");
    $conn->exec("TRUNCATE TABLE bookings");
    $conn->exec("TRUNCATE TABLE seats");
    echo "Cleared all bookings and seats.\n";

    $adminEmail = "admin@admin.com";
    $adminPass = password_hash("Admin1234", PASSWORD_BCRYPT);
    
    // Check if requested admin exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$adminEmail]);
    $admin = $stmt->fetch();

    if (!$admin) {
        $conn->prepare("INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, 'admin', 1)")
             ->execute(["System Admin", $adminEmail, $adminPass]);
        echo "Created requested admin account: $adminEmail\n";
    } else {
        $conn->prepare("UPDATE users SET password = ?, role = 'admin', is_verified = 1 WHERE email = ?")
             ->execute([$adminPass, $adminEmail]);
        echo "Updated existing admin account: $adminEmail (Password: Admin1234)\n";
    }

    // Delete all other users
    $conn->prepare("DELETE FROM users WHERE email != ?")->execute([$adminEmail]);
    echo "Deleted all other users.\n";
    
    $conn->exec("SET FOREIGN_KEY_CHECKS = 1");

    // 4. Create upload directories
    $dirs = [
        'uploads/student_ids',
        'uploads/passports'
    ];
    foreach ($dirs as $dir) {
        if (!file_exists($dir)) {
            mkdir($dir, 0777, true);
            echo "Created directory: $dir\n";
        }
    }

    echo "Migration completed successfully!\n";

} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
