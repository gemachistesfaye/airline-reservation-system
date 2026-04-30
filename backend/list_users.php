<?php
try {
    $conn = new PDO("mysql:host=localhost;dbname=airline_db", "root", "");
    $stmt = $conn->query("SELECT id, name, email, role FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($users, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo $e->getMessage();
}
