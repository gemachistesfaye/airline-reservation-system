<?php

require_once "config/database.php";

$token = $_GET['token'];

$stmt = $conn->prepare("
    UPDATE passengers 
    SET is_verified = 1 
    WHERE verification_token = ?
");

$stmt->execute([$token]);

echo "Email verified successfully!";