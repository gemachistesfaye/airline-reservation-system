# ✈️ AeroSpace Airline Reservation - API Documentation

This document outlines the RESTful API endpoints for the Airline Ticket Reservation System developed for **Haramaya University (College of Computing and Information Science)**.

---

## 🔐 Authentication
The system uses **JWT (JSON Web Token)** for secure stateless authentication.
- **Header:** `Authorization: Bearer <token>`
- **Roles:** `user` (Passenger) and `admin` (Administrator)

---

## 👤 Authentication Endpoints
| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/login` | `POST` | Public | Authenticate user/admin and receive JWT token. |
| `/register` | `POST` | Public | Create a new passenger account. |
| `/verify-email` | `GET` | Public | Confirm account via email link. |
| `/forgot-password` | `POST` | Public | Request a password reset link. |
| `/reset-password` | `POST` | Public | Set a new password using a reset token. |
| `/change-password` | `POST` | Auth | Update password for logged-in users. |

---

## 🎫 Passenger Endpoints
| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/flights` | `GET` | User | Search for available flights. |
| `/seats` | `GET` | User | Get real-time seat map and availability for a flight. |
| `/book` | `POST` | User | **Passenger Only:** Book a specific seat on a flight. |
| `/my-bookings` | `GET` | User | View personal booking history and tickets. |
| `/cancel-booking/{id}` | `DELETE`| User | Cancel a confirmed booking. |
| `/profile` | `GET/POST` | User | View or update personal profile (Passport, DOB, etc). |

---

## 🛡️ Administrative Endpoints
| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/admin/stats` | `GET` | Admin | Get global statistics (Total Flights, Bookings, Users). |
| `/admin/analytics` | `GET` | Admin | Get occupancy rates and booking trends. |
| `/admin/bookings` | `GET` | Admin | **Global Manifest:** View every booking in the system. |
| `/admin/flights` | `POST` | Admin | Establish a new flight route. |
| `/admin/flights/{id}` | `PUT` | Admin | Update flight details or status. |
| `/admin/flights` | `DELETE` | Admin | Remove a flight and its associated bookings. |
| `/admin/users` | `GET` | Admin | List all registered users in the system. |
| `/admin/users/toggle` | `POST` | Admin | Verify or suspend a user account. |

---

## 🛠️ Technical Stack
- **Backend:** PHP 8.x (RESTful Controllers)
- **Database:** MySQL (Relational Schema)
- **Auth:** JWT (Firebase/JWT)
- **Frontend:** React + Tailwind CSS + Vite
- **Email:** SMTP (Mailtrap/Gmail)

---

**Developed by:** 
Bonsa Horsa, Daniel Alemayehu, Gelata Driba, Gemachis Tesfaye, Hawi Desalegn, Kalid Abdi, Kenenisa Gudeta, Sisay Tasew.

*Submitted to: Mr. Belete (Advanced Web Programming)*
