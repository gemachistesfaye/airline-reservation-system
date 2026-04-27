<?php
require_once "config/database.php";
$db = new Database();
$conn = $db->connect();

$sql = "
ALTER TABLE passengers 
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reset_token_expiry DATETIME DEFAULT NULL;

ALTER TABLE passengers 
MODIFY COLUMN is_verified TINYINT(1) DEFAULT 0,
MODIFY COLUMN verification_token VARCHAR(100) DEFAULT NULL;
";

try {
    $conn->exec($sql);
    echo "Migration successful!\n";
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
