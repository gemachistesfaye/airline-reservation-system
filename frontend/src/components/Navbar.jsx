import { Link, useNavigate, useLocation } from "react-router-dom";
import { Plane, User, LayoutDashboard, LogOut, Home, Compass, Users, Settings } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAuth = !!localStorage.getItem("token");
  const role = user.role || 'user';

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed top-0 w-full z-[100] px-6 py-4">
      <div className="max-w-7xl mx-auto bg-white/70 backdrop-blur-xl rounded-[2rem] px-8 py-3 flex justify-between items-center shadow-2xl shadow-blue-900/5 border border-white/40">
        
        <h1 className="font-display font-black text-2xl text-gray-900 tracking-tighter flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
            <Plane size={24} fill="currentColor" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500">AeroSpace</span>
        </h1>

        <div className="flex items-center gap-6 font-bold text-gray-500 text-[11px] uppercase tracking-widest">
          {/* COMMON LINKS */}
          <Link to="/" className={`flex items-center gap-2 hover:text-primary-600 transition-colors ${isActive('/') ? 'text-primary-600' : ''}`}>
            <Home size={16} /> Home
          </Link>

          {!isAuth ? (
             <>
               <Link to="/flights" className={`flex items-center gap-2 hover:text-primary-600 transition-colors ${isActive('/flights') ? 'text-primary-600' : ''}`}>
                 <Compass size={16} /> Flights
               </Link>
               <Link to="/login" className="bg-primary-600 text-white hover:bg-primary-700 px-6 py-2.5 rounded-xl shadow-xl shadow-primary-500/20 transition-all active:scale-95 ml-2">
                 Sign In
               </Link>
             </>
          ) : (
            <>
              {/* ROLE-BASED LINKS */}
              {role === 'admin' ? (
                <>
                  <Link to="/admin" className={`flex items-center gap-2 hover:text-primary-600 transition-colors ${location.pathname.startsWith('/admin') ? 'text-primary-600' : ''}`}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link to="/flights" className={`flex items-center gap-2 hover:text-primary-600 transition-colors ${isActive('/flights') ? 'text-primary-600' : ''}`}>
                    <Compass size={16} /> Monitor
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/flights" className={`flex items-center gap-2 hover:text-primary-600 transition-colors ${isActive('/flights') ? 'text-primary-600' : ''}`}>
                    <Compass size={16} /> Flights
                  </Link>
                  <Link to="/dashboard" className={`flex items-center gap-2 hover:text-primary-600 transition-colors ${isActive('/dashboard') ? 'text-primary-600' : ''}`}>
                    <Plane size={16} /> My Trips
                  </Link>
                  <Link to="/profile" className={`flex items-center gap-2 hover:text-primary-600 transition-colors ${isActive('/profile') ? 'text-primary-600' : ''}`}>
                    <User size={16} /> Profile
                  </Link>
                </>
              )}

              <button
                onClick={logout}
                className="bg-gray-900 text-white hover:bg-black px-5 py-2.5 rounded-xl shadow-xl shadow-gray-200 transition-all active:scale-95 flex items-center gap-2 ml-4"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}