<?php
require_once "backend/config/Database.php";

try {
    $db = new Database();
    $conn = $db->connect();

    // 1. Add username to users table
    try {
        $conn->exec("ALTER TABLE users ADD COLUMN username VARCHAR(50) DEFAULT NULL AFTER name");
        echo "Added column: username\n";
    } catch (PDOException $e) {
        if ($e->getCode() == '42S21') echo "Column username already exists.\n";
        else throw $e;
    }

    // 2. Ensure passport_file exists (from previous migration)
    try {
        $conn->exec("ALTER TABLE users ADD COLUMN passport_file VARCHAR(255) DEFAULT NULL AFTER student_id_file");
        echo "Added column: passport_file\n";
    } catch (PDOException $e) {
        if ($e->getCode() == '42S21') echo "Column passport_file already exists.\n";
        else throw $e;
    }

    echo "Migration completed successfully!\n";

} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
