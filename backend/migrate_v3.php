<?php
require_once "config/Database.php";
$db = new Database();
$conn = $db->connect();

try {
    // 1. Add 'name' column if it doesn't exist
    $conn->exec("ALTER TABLE users ADD COLUMN name VARCHAR(100) AFTER last_name");
    echo "Column 'name' added.\n";
    
    // 2. Populate 'name' from 'first_name' and 'last_name'
    $conn->exec("UPDATE users SET name = CONCAT(first_name, ' ', last_name)");
    echo "Names merged into 'name' column.\n";
    
    // 3. Drop 'first_name' and 'last_name'
    $conn->exec("ALTER TABLE users DROP COLUMN first_name, DROP COLUMN last_name");
    echo "Old name columns dropped.\n";
    
    // 4. Drop 'username' if it's redundant
    $conn->exec("ALTER TABLE users DROP COLUMN username");
    echo "Redundant username column dropped.\n";

} catch (Exception $e) {
    echo "Migration Note: " . $e->getMessage() . "\n";
}
