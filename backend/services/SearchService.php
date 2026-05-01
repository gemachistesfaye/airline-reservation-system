<?php

class SearchService {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function searchFlights($filters) {
        $query = "SELECT *, 
                 TIMESTAMPDIFF(MINUTE, departure_time, arrival_time) as duration_minutes
                 FROM flights WHERE 1=1";
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

        // Price Range Filter
        if (!empty($filters['min_price'])) {
            $query .= " AND base_price >= ?";
            $params[] = (float)$filters['min_price'];
        }
        if (!empty($filters['max_price'])) {
            $query .= " AND base_price <= ?";
            $params[] = (float)$filters['max_price'];
        }

        // Seat Class Availability Filter
        if (!empty($filters['seat_class'])) {
            $class = strtolower($filters['seat_class']);
            if (strpos($class, 'economy') !== false) {
                $query .= " AND economy_seats_avail > 0";
            } elseif (strpos($class, 'business') !== false) {
                $query .= " AND business_seats_avail > 0";
            } elseif (strpos($class, 'first') !== false) {
                $query .= " AND first_class_seats_avail > 0";
            }
        }

        // Departure Time Slot Filter
        if (!empty($filters['departure_time_slot'])) {
            switch ($filters['departure_time_slot']) {
                case 'morning':
                    $query .= " AND HOUR(departure_time) BETWEEN 6 AND 11";
                    break;
                case 'afternoon':
                    $query .= " AND HOUR(departure_time) BETWEEN 12 AND 17";
                    break;
                case 'evening':
                    $query .= " AND (HOUR(departure_time) >= 18 OR HOUR(departure_time) < 6)";
                    break;
            }
        }

        if (!empty($filters['status'])) {
            $query .= " AND status = ?";
            $params[] = $filters['status'];
        }

        // --- SORTING ---
        $sort = "departure_time ASC"; // Default
        if (!empty($filters['sort_by'])) {
            switch ($filters['sort_by']) {
                case 'cheapest':
                    $sort = "base_price ASC";
                    break;
                case 'fastest':
                    $sort = "duration_minutes ASC";
                    break;
            }
        }

        // --- PAGINATION ---
        $page = isset($filters['page']) ? (int)$filters['page'] : 1;
        $limit = isset($filters['limit']) ? (int)$filters['limit'] : 10;
        $offset = ($page - 1) * $limit;

        // Get total count for pagination metadata
        $countQuery = "SELECT COUNT(*) as total FROM (" . $query . ") as filtered_flights";
        $countStmt = $this->conn->prepare($countQuery);
        $countStmt->execute($params);
        $totalItems = (int)$countStmt->fetch(PDO::FETCH_ASSOC)['total'];

        // Final Query with Sorting and Pagination
        $query .= " ORDER BY $sort LIMIT $limit OFFSET $offset";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        $flights = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Map duration to human-readable format
        foreach ($flights as &$flight) {
            $mins = $flight['duration_minutes'];
            $hours = floor($mins / 60);
            $remaining_mins = $mins % 60;
            $flight['duration_label'] = "{$hours}h {$remaining_mins}m";
        }

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
