# Airline Ticket Reservation System - Implementation Plan

This document outlines the architecture, database schema, API design, and implementation logic to transform the current Airline Reservation System into a realistic, production-level platform.

## 1. Full System Architecture (Frontend + Backend Flow)

### Technology Stack
*   **Frontend**: React.js (JavaScript), Tailwind CSS, React Router DOM, Framer Motion (animations), Vite.
*   **Backend**: Pure PHP (no frameworks), PDO for secure database access, PHPMailer for SMTP.
*   **Database**: MySQL.

### Data Flow Architecture
1.  **Client Layer (React)**: Handles UI rendering, user interactions, form validation, and state management. Sends HTTP requests (fetch/axios) to the API.
2.  **API Layer (PHP Routes)**: `api.php` acts as the single entry point. It parses the request URI and method, and routes it to the appropriate Controller.
3.  **Middleware Layer (PHP)**: `AuthMiddleware.php` validates JWT tokens passed in the `Authorization` header before allowing access to protected controller methods.
4.  **Controller Layer (PHP)**: Receives requests, validates input, interacts with services and database, and returns JSON responses.
5.  **Service Layer (PHP)**: Encapsulates complex logic (e.g., `EmailService`, `SearchService`).
6.  **Database Layer (MySQL)**: Stores structured data. Uses ACID transactions to prevent race conditions during booking.

---

## 2. Booking System Logic (Step-by-Step)

The booking system uses atomic operations to prevent double-booking.

*   **Step 1: Select Flight**: User searches and selects a flight from the UI.
*   **Step 2: Select Seat Class**: User chooses First, Business, or Economy. UI checks `available_seats` for that class.
*   **Step 3: Show Available Seats**: The `SeatSelector` component fetches the visual seat map for the selected flight.
*   **Step 4: User Selects Seat**: User clicks a green (available) seat.
*   **Step 5: Apply Discounts (New)**: If the user profile indicates `student`, a 10-30% discount is applied to the base price before confirmation.
*   **Step 6: Confirm Booking (Backend Transaction)**:
    1.  Backend receives `flight_id`, `seat_number`, `seat_class`.
    2.  `START TRANSACTION`.
    3.  Lock the flight row: `SELECT * FROM flights WHERE flight_id = ? FOR UPDATE`. Verify class capacity > 0.
    4.  Lock the seat row: `SELECT * FROM seats WHERE flight_id = ? AND seat_number = ? FOR UPDATE`. Verify `availability_status` is 'available'.
    5.  Insert booking record with `payment_status = 'pending'`.
    6.  Update flight class availability count (`economy_seats_avail = economy_seats_avail - 1`).
    7.  Update seat status to 'booked'.
    8.  `COMMIT`. (If any step fails, `ROLLBACK`).
*   **Step 7: Payment Simulation**: Send an email with a payment link `/payment/{booking_id}`. Once clicked, status updates to 'confirmed'.

---

## 3. Seat Class System Implementation Logic

*   **Flight Creation**: When an Admin creates a flight, they specify the number of First Class, Business, and Economy seats.
*   **Seat Generation**: The backend automatically generates seat records (e.g., 1A, 1B, 2A) assigned to specific classes based on the counts.
*   **Availability Tracking**: The `flights` table maintains denormalized counters for fast querying: `first_class_seats_avail`, `business_seats_avail`, `economy_seats_avail`. These are strictly updated within transactions when bookings occur.

---

## 4. Email System Integration (Gmail SMTP)

Uses `PHPMailer` configured with Gmail SMTP to simulate realistic workflows.

*   **Verification**: On registration, a secure random token is generated and saved to the DB. An email with `/verify-email?token={token}` is sent. Login is blocked if `is_verified = 0`.
*   **Password Reset**: User requests reset. A token with an expiry timestamp is generated. Email sent with `/reset-password?token={token}`.
*   **Payment Simulation**: Upon successful booking transaction, an email containing flight details and a `/payment/{booking_id}` link is dispatched.

---

## 5. Database Schema Design (Upgrades Needed)

> [!WARNING]
> We need to update the existing `database.sql` to fully support these requirements.

### Table: `users` (Renamed from passengers to support roles)
*   `id` INT PK AUTO_INCREMENT
*   `first_name` VARCHAR, `last_name` VARCHAR, `username` VARCHAR
*   `email` VARCHAR UNIQUE, `password` VARCHAR
*   `role` ENUM('user', 'admin') DEFAULT 'user'
*   `user_type` ENUM('regular', 'student') DEFAULT 'regular' **[NEW: For Discounts]**
*   `is_verified` TINYINT DEFAULT 0
*   `verification_token` VARCHAR
*   `reset_token` VARCHAR, `reset_token_expiry` DATETIME

### Table: `flights`
*   `flight_id` INT PK, `flight_number` VARCHAR
*   `origin`, `destination`, `departure_time`, `arrival_time`
*   `base_price` DECIMAL(10,2) **[NEW: For pricing/discounts]**
*   `total_seats`, `available_seats`
*   `economy_seats_total`, `economy_seats_avail`
*   `business_seats_total`, `business_seats_avail`
*   `first_class_seats_total`, `first_class_seats_avail`
*   `status` ENUM('Scheduled', 'Delayed', 'Cancelled', 'Completed')

### Table: `seats`
*   `seat_id` INT PK, `flight_id` INT FK
*   `seat_number` VARCHAR, `class` ENUM('Economy Class', 'Business Class', 'First Class')
*   `availability_status` ENUM('available', 'booked')

### Table: `bookings`
*   `booking_id` INT PK, `user_id` INT FK, `flight_id` INT FK
*   `seat_number` VARCHAR, `seat_class` VARCHAR
*   `booking_date` TIMESTAMP
*   `status` ENUM('Confirmed', 'Cancelled', 'Pending Payment')
*   `payment_status` ENUM('pending', 'paid')
*   `ticket_number` VARCHAR UNIQUE

---

## 6. API Endpoints List

All endpoints return strict JSON.

**Auth & Users:**
*   `POST /api/register`: Create user (generates verification token).
*   `POST /api/login`: Authenticate and return JWT.
*   `GET /api/verify-email?token=...`: Verify user account.
*   `POST /api/forgot-password`: Send reset link.
*   `POST /api/reset-password`: Reset with token.
*   `GET /api/profile`: Get logged-in user details.
*   `POST /api/profile`: Update user details (name, phone, `user_type`).

**Flights (Public):**
*   `GET /api/flights`: Smart search (filters: origin, destination, date, class, price range; sorting: cheapest/fastest).
*   `GET /api/flights/{id}`: Get specific flight details.
*   `GET /api/seats?flight_id={id}`: Get seat map for a flight.

**Bookings (Protected):**
*   `POST /api/book`: Create a new booking (requires JWT, uses transactions).
*   `GET /api/my-bookings`: Get user's bookings.
*   `POST /api/process-payment/{booking_id}`: Simulate payment success.
*   `POST /api/cancel`: Cancel booking and free seat.

**Admin (Protected, Role=Admin):**
*   `GET /api/admin/stats`: Get high-level counts.
*   `GET /api/admin/analytics`: Get occupancy rates and booking trends.
*   `POST /api/admin/flights`: Create a new flight.
*   `PUT /api/admin/flights/{id}`: Update flight details.
*   `DELETE /api/admin/flights`: Delete a flight.
*   `GET /api/admin/bookings`: View all system bookings.
*   `GET /api/admin/users`: View all users.

---

## 7. Security Rules

1.  **JWT Authentication**: All protected routes require a valid JWT passed via `Authorization: Bearer <token>`.
2.  **Role Validation**: Backend strictly checks `$user->role === 'admin'` before allowing access to Admin endpoints. Frontend role checks are for UI hiding only; the backend is the source of truth.
3.  **Atomic Updates**: `FOR UPDATE` is used in SQL queries to lock rows during booking, preventing race conditions where two users book the same seat simultaneously.
4.  **SQL Injection Prevention**: All database queries use PDO Prepared Statements.
5.  **Password Hashing**: Passwords stored using `PASSWORD_BCRYPT`.
6.  **Token Expiry**: Password reset tokens must include an expiration time.

---

## 8. UI Structure for React (JavaScript Only)

Using Tailwind CSS for modern aesthetics.

*   `App.jsx`: Routing setup with `react-router-dom` and `framer-motion` for page transitions.
*   **Components**:
    *   `Navbar.jsx`: Responsive navigation. Shows Login/Register or Profile/Logout based on auth state.
    *   `FlightSearch.jsx`: **[NEW]** Advanced search form with filters (price, class, time) and sorting dropdowns.
    *   `SeatSelector.jsx`: Visual airplane map rendering seats dynamically based on API data (Colors: Green, Red, Blue).
    *   `BookingSummary.jsx`: Displays selected flight, seat, base price, applies student discount badge if applicable, and shows final total.
*   **Pages**:
    *   `Home.jsx`: Landing page with hero section and `FlightSearch` component.
    *   `Flights.jsx`: Search results page displaying available flights.
    *   `Booking.jsx`: Multi-step booking wizard (Select Class -> Select Seat -> Confirm).
    *   `Dashboard.jsx`: User profile, "🎓 Student Discount Applied" indicator, and list of upcoming/past bookings.
    *   `Admin.jsx`: Admin dashboard with analytics charts, flight management CRUD table, and system bookings view.
    *   Auth Pages: `Login`, `Register`, `ForgotPassword`, `ResetPassword`.

---

## User Review Required
> [!IMPORTANT]
> The database schema requires the addition of a `user_type` enum ('regular', 'student') to the `users` table, and a `base_price` to the `flights` table to fully implement the student discount system and price sorting requirements.
> Please review this plan. Upon your approval, I will execute the necessary database migrations, backend controller updates, and React frontend enhancements to achieve the final goal.
