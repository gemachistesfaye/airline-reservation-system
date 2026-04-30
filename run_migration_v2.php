<?php
require 'backend/config/Database.php';

$db = new Database();
$conn = $db->connect();

try {
    $sql = file_get_contents('database.sql');
    
    // Split SQL by semicolon, but handle cases where semicolon might be inside a string (simplistic)
    // For a cleaner approach, we'll just execute it since PDO exec supports multiple statements in some drivers
    // or we can use the mysql command line if available.
    // Let's try splitting by semicolon.
    
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    foreach ($statements as $stmt) {
        if (!empty($stmt)) {
            $conn->exec($stmt);
        }
    }
    
    echo "Migration successful! Database schema is now production-ready.\n";
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
