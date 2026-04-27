CREATE DATABASE IF NOT EXISTS airline_db;
USE airline_db;

CREATE TABLE IF NOT EXISTS passengers (
    passenger_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    passport_number VARCHAR(50),
    phone_number VARCHAR(20),
    date_of_birth DATE,
    verification_token VARCHAR(100),
    is_verified TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flights (
    flight_id INT AUTO_INCREMENT PRIMARY KEY,
    flight_number VARCHAR(20) NOT NULL UNIQUE,
    origin VARCHAR(50) NOT NULL,
    destination VARCHAR(50) NOT NULL,
    departure_time DATETIME,
    arrival_time DATETIME,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    status ENUM('Scheduled', 'Delayed', 'Cancelled', 'Completed') DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seats (
    seat_id INT AUTO_INCREMENT PRIMARY KEY,
    flight_id INT NOT NULL,
    seat_number VARCHAR(5) NOT NULL,
    class ENUM('Economy', 'Business', 'First') DEFAULT 'Economy',
    availability_status ENUM('available', 'booked') DEFAULT 'available',
    FOREIGN KEY (flight_id) REFERENCES flights(flight_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    passenger_id INT NOT NULL,
    flight_id INT NOT NULL,
    seat_number VARCHAR(5) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Confirmed', 'Cancelled', 'Pending') DEFAULT 'Confirmed',
    ticket_number VARCHAR(50) UNIQUE,
    FOREIGN KEY (passenger_id) REFERENCES passengers(passenger_id) ON DELETE CASCADE,
    FOREIGN KEY (flight_id) REFERENCES flights(flight_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('SuperAdmin', 'Admin') DEFAULT 'Admin',
    last_login TIMESTAMP NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active'
);

-- Insert a default admin for testing (password is 'password123')
INSERT IGNORE INTO admins (username, email, password, role) VALUES 
('admin', 'admin@airline.com', '$2y$10$rFHQS6xz43jhv/WWCNjFBOZ7/W2E2iqPWEo/PGMyDLITUmU7Jxsde', 'SuperAdmin');
