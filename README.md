# Airline Reservation System

A simple, modern, and clean web application for booking airline tickets. This project is divided into two clear, distinct parts: the **Frontend** (React) and the **Backend** (PHP).

## Project Structure

This project has been deliberately simplified to make it easy to understand and present:

```text
airline-reservation-system/
│
├── frontend/                # The User Interface (React + Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI parts (Navbar, SeatSelector)
│   │   ├── pages/           # Main views (Home, Flights, Dashboard)
│   │   └── services/        # API calls to the backend
│   └── package.json         # Frontend dependencies
│
└── backend/                 # The Server & Database Logic (PHP)
    ├── config/              # Database connection settings
    ├── controllers/         # Handles the business logic (Booking, Auth)
    ├── models/              # Database interactions
    ├── routes/              # Defines API endpoints
    ├── database.sql         # The full database structure and tables
    ├── seed_db.php          # Script to generate sample flight data
    └── index.php            # Main entry point for all API requests
```

## How It Works (The Flow)

1. **User interacts with the `frontend`**: They browse flights, select seats, or log in.
2. **Frontend calls the `backend`**: Using JavaScript (in `frontend/src/services`), it sends a request to `backend/index.php`.
3. **Backend processes the request**: The `routes` folder directs the request to the right `controller`, which uses `models` to read/write to the MySQL database.
4. **Data returns to Frontend**: The backend sends a JSON response back to React, updating what the user sees.

## Setup Instructions for Presentation

**1. Database Setup:**
- Create a database in phpMyAdmin.
- Import `backend/database.sql` into your database.
- Run `php backend/seed_db.php` in your terminal to populate the database with sample flights and an admin user.

**2. Start Backend:**
- Ensure your XAMPP Apache and MySQL are running.
- The backend API is accessible at: `http://localhost/airline-reservation-system/backend/`

**3. Start Frontend:**
- Open a terminal in the `frontend/` folder.
- Run `npm install` (if you haven't already).
- Run `npm run dev`.
- Open the provided localhost link in your browser!
