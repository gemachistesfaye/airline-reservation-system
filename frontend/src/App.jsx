import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Flights from "./pages/Flights";
import Booking from "./pages/Booking";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastProvider } from "./components/Toast";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) return <Navigate to="/login" />;

  // If page is for Admins but user is a Passenger -> Send to Flights
  if (adminOnly && user.role !== 'admin') return <Navigate to="/flights" />;

  // If page is for Passengers but user is an Admin -> Send to Admin Dashboard
  if (!adminOnly && user.role === 'admin') return <Navigate to="/admin" />;

  return children;
};

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <PageTransition>
                <ChangePassword />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/flights"
          element={
            <PageTransition>
              <Flights />
            </PageTransition>
          }
        />
        
        <Route
          path="/booking/:id"
          element={
            <ProtectedRoute>
              <PageTransition>
                <Booking />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageTransition>
                <Dashboard />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PageTransition>
                <Profile />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* ADMIN ROUTE */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <PageTransition>
                <Admin />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Navbar />
        <div className="min-h-[80vh]">
          <AnimatedRoutes />
        </div>
        <Footer />
      </BrowserRouter>
    </ToastProvider>
  );
}