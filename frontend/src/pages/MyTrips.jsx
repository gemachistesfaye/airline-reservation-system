import React, { useEffect, useState } from "react";

export default function MyTrips() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api.php?route=my-bookings")
      .then(res => res.json())
      .then(data => {
        setBookings(data.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load bookings");
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div >{error}</div>;

  return (
    <div >
      <div >
        <h1 >My Trips</h1>
        <ul >
          {bookings.length === 0 && <li>No bookings found.</li>}
          {bookings.map(b => (
            <li key={b.booking_id} >
              <div>
                <div >Flight: {b.flight_number}</div>
                <div >{b.origin} → {b.destination}</div>
                <div >{b.departure_time}</div>
              </div>
              <div >
                <div>Seat: <span >{b.seat_number}</span></div>
                <div>Class: <span >{b.seat_class}</span></div>
                <div>Status: <span >{b.status}</span></div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
