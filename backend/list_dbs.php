<?php
try {
    $conn = new PDO("mysql:host=localhost", "root", "");
    $stmt = $conn->query("SHOW DATABASES");
    $dbs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($dbs, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo $e->getMessage();
}
