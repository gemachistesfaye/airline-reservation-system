CREATE DATABASE IF NOT EXISTS airline_db;
USE airline_db;

-- 1. Unified USERS Table (RBAC + Student Type + Verification)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    user_type ENUM('regular', 'student') DEFAULT 'regular',
    is_verified TINYINT(1) DEFAULT 0,
    verification_token VARCHAR(100),
    reset_token VARCHAR(100),
    token_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. FLIGHTS Table (Class-specific capacity + Base Price)
CREATE TABLE IF NOT EXISTS flights (
    flight_id INT AUTO_INCREMENT PRIMARY KEY,
    flight_number VARCHAR(20) NOT NULL UNIQUE,
    origin VARCHAR(50) NOT NULL,
    destination VARCHAR(50) NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
    economy_seats_total INT NOT NULL DEFAULT 40,
    economy_seats_avail INT NOT NULL DEFAULT 40,
    business_seats_total INT NOT NULL DEFAULT 12,
    business_seats_avail INT NOT NULL DEFAULT 12,
    first_class_seats_total INT NOT NULL DEFAULT 6,
    first_class_seats_avail INT NOT NULL DEFAULT 6,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    status ENUM('Scheduled', 'Delayed', 'Cancelled', 'Completed') DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. SEATS Table (For Visual Map)
CREATE TABLE IF NOT EXISTS seats (
    seat_id INT AUTO_INCREMENT PRIMARY KEY,
    flight_id INT NOT NULL,
    seat_number VARCHAR(5) NOT NULL,
    class ENUM('Economy Class', 'Business Class', 'First Class') DEFAULT 'Economy Class',
    availability_status ENUM('available', 'booked', 'selected') DEFAULT 'available',
    FOREIGN KEY (flight_id) REFERENCES flights(flight_id) ON DELETE CASCADE,
    UNIQUE KEY (flight_id, seat_number)
);

-- 4. BOOKINGS Table (Status-driven + Payment Link support)
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    flight_id INT NOT NULL,
    seat_number VARCHAR(5) NOT NULL,
    seat_class ENUM('Economy Class', 'Business Class', 'First Class') NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_price DECIMAL(10, 2) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Confirmed', 'Cancelled', 'Pending Payment') DEFAULT 'Pending Payment',
    payment_status ENUM('pending', 'paid') DEFAULT 'pending',
    ticket_number VARCHAR(50) UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (flight_id) REFERENCES flights(flight_id) ON DELETE CASCADE
);

-- 5. Default Admin (Password: password123)
INSERT IGNORE INTO users (name, email, password, role, is_verified) VALUES 
('System Admin', 'admin@airline.com', '$2y$10$rFHQS6xz43jhv/WWCNjFBOZ7/W2E2iqPWEo/PGMyDLITUmU7Jxsde', 'admin', 1);

-- 6. Sample Flight for Testing
INSERT IGNORE INTO flights (flight_number, origin, destination, departure_time, arrival_time, base_price, total_seats, available_seats)
VALUES ('ET302', 'Addis Ababa', 'Nairobi', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY + 2 HOUR), 250.00, 58, 58);
