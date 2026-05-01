const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost/airline-reservation-system/backend";

const getToken = () => localStorage.getItem("token");

const handleResponse = async (res) => {
  const contentType = res.headers.get("content-type");
  
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error("Invalid response format:", text);
    throw new Error("Server returned invalid format (not JSON). Check console.");
  }

  const data = await res.json();
  if (!res.ok || data.status === "error") {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
};

const getHeaders = (auth = true) => {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const getAuthHeadersOnly = () => {
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

// --- AUTH ---
export const registerUser = (data) => 
  fetch(`${BASE_URL}/register`, { method: "POST", headers: getHeaders(false), body: JSON.stringify(data) }).then(handleResponse);

export const loginUser = (data) => 
  fetch(`${BASE_URL}/login`, { method: "POST", headers: getHeaders(false), body: JSON.stringify(data) }).then(handleResponse);

export const forgotPassword = (data) => 
  fetch(`${BASE_URL}/forgot-password`, { method: "POST", headers: getHeaders(false), body: JSON.stringify(data) }).then(handleResponse);

export const resetPassword = (data) => 
  fetch(`${BASE_URL}/reset-password`, { method: "POST", headers: getHeaders(false), body: JSON.stringify(data) }).then(handleResponse);

export const changePassword = (data) => 
  fetch(`${BASE_URL}/change-password`, { method: "POST", headers: getHeaders(true), body: JSON.stringify(data) }).then(handleResponse);

// --- PROFILE ---
export const getUserProfile = () => 
  fetch(`${BASE_URL}/profile`, { headers: getHeaders(true) }).then(handleResponse);

export const updateUserProfile = (data) => 
  fetch(`${BASE_URL}/profile`, { method: "POST", headers: getHeaders(true), body: JSON.stringify(data) }).then(handleResponse);

export const uploadStudentId = (file) => {
  const body = new FormData();
  body.append("student_id_file", file);
  return fetch(`${BASE_URL}/profile/student-id`, {
    method: "POST",
    headers: getAuthHeadersOnly(),
    body
  }).then(handleResponse);
};

// --- FLIGHTS ---
export const getFlights = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetch(`${BASE_URL}/flights?${query}`, { headers: getHeaders(true) }).then(handleResponse);
};

export const getFlight = (id) => 
  fetch(`${BASE_URL}/flights/${id}`, { headers: getHeaders(true) }).then(handleResponse);

// --- SEATS ---
export const getSeats = (flightId) => 
  fetch(`${BASE_URL}/seats?flight_id=${flightId}`, { headers: getHeaders(true) }).then(handleResponse);

// --- BOOKINGS ---
export const bookFlight = (data) => 
  fetch(`${BASE_URL}/book`, { method: "POST", headers: getHeaders(true), body: JSON.stringify(data) }).then(handleResponse);

export const getUserBookings = () => 
  fetch(`${BASE_URL}/my-bookings`, { headers: getHeaders(true) }).then(handleResponse);

export const cancelBooking = (bookingId) => 
  fetch(`${BASE_URL}/cancel-booking/${bookingId}`, { method: "DELETE", headers: getHeaders(true) }).then(handleResponse);

export const processPayment = (bookingId) =>
  fetch(`${BASE_URL}/process-payment/${bookingId}`, { method: "POST", headers: getHeaders(false) }).then(handleResponse);

// --- ADMIN ---
export const adminGetStats = () => 
  fetch(`${BASE_URL}/admin/stats`, { headers: getHeaders(true) }).then(handleResponse);

export const adminGetAnalytics = () => 
  fetch(`${BASE_URL}/admin/analytics`, { headers: getHeaders(true) }).then(handleResponse);

export const adminGetBookings = () => 
  fetch(`${BASE_URL}/admin/bookings`, { headers: getHeaders(true) }).then(handleResponse);

export const adminAddFlight = (data) => 
  fetch(`${BASE_URL}/admin/flights`, { method: "POST", headers: getHeaders(true), body: JSON.stringify(data) }).then(handleResponse);

export const adminUpdateFlight = (data) => 
  fetch(`${BASE_URL}/admin/flights/${data.flight_id}`, { method: "PUT", headers: getHeaders(true), body: JSON.stringify(data) }).then(handleResponse);

export const adminDeleteFlight = (id) => 
  fetch(`${BASE_URL}/admin/flights`, { method: "DELETE", headers: getHeaders(true), body: JSON.stringify({ flight_id: id }) }).then(handleResponse);

export const adminGetUsers = () => 
  fetch(`${BASE_URL}/admin/users`, { headers: getHeaders(true) }).then(handleResponse);

export const adminToggleUserStatus = (userId) => 
  fetch(`${BASE_URL}/admin/users/toggle`, { method: "POST", headers: getHeaders(true), body: JSON.stringify({ id: userId }) }).then(handleResponse);

export const adminGetStudentVerifications = () =>
  fetch(`${BASE_URL}/admin/student-verifications`, { headers: getHeaders(true) }).then(handleResponse);

export const adminReviewStudentVerification = (userId, action) =>
  fetch(`${BASE_URL}/admin/student-verifications/${userId}`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify({ action })
  }).then(handleResponse);