<?php

class SearchService {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function searchFlights($filters) {
        $query = "SELECT * FROM flights WHERE 1=1";
        $params = [];

        // --- FILTERS ---
        if (!empty($filters['origin'])) {
            $query .= " AND origin LIKE ?";
            $params[] = "%" . $filters['origin'] . "%";
        }

        if (!empty($filters['destination'])) {
            $query .= " AND destination LIKE ?";
            $params[] = "%" . $filters['destination'] . "%";
        }

        if (!empty($filters['date'])) {
            $query .= " AND DATE(departure_time) = ?";
            $params[] = $filters['date'];
        }

        if (!empty($filters['min_price'])) {
            // Price isn't in current schema, but we'll assume it's added or use total_seats as a proxy for demo
            // Actually, let's keep it clean for now.
        }

        if (!empty($filters['status'])) {
            $query .= " AND status = ?";
            $params[] = $filters['status'];
        }

        // --- PAGINATION ---
        $page = isset($filters['page']) ? (int)$filters['page'] : 1;
        $limit = isset($filters['limit']) ? (int)$filters['limit'] : 10;
        $offset = ($page - 1) * $limit;

        // Get total count for pagination metadata
        $countStmt = $this->conn->prepare($query);
        $countStmt->execute($params);
        $totalItems = $countStmt->rowCount();

        // Final Query
        $query .= " ORDER BY departure_time ASC LIMIT $limit OFFSET $offset";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        $flights = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            "items" => $flights,
            "meta" => [
                "total" => $totalItems,
                "page" => $page,
                "limit" => $limit,
                "total_pages" => ceil($totalItems / $limit)
            ]
        ];
    }
}
