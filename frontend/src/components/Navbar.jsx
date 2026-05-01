import { Link, useNavigate, useLocation } from "react-router-dom";
import { Plane, User, LayoutDashboard, LogOut, Home, Compass, Users, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

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

              <div className="relative ml-4" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="bg-gray-900 text-white hover:bg-black px-4 py-2 rounded-xl shadow-xl shadow-gray-200 transition-all active:scale-95 flex items-center gap-2"
                >
                  <span className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center text-xs font-black">
                    {String(user.name || "U").charAt(0).toUpperCase()}
                  </span>
                  <span className="font-black text-[11px] normal-case">{user.name || "Profile"}</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl shadow-blue-900/10">
                    <div className="pb-3 border-b border-gray-100">
                      <div className="font-black text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      <span className="inline-flex mt-2 rounded-full bg-primary-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-primary-700">
                        {role}
                      </span>
                    </div>
                    <button onClick={() => { setProfileOpen(false); navigate("/profile"); }} className="w-full text-left mt-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
                      Profile
                    </button>
                    <button onClick={() => { setProfileOpen(false); navigate("/dashboard"); }} className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
                      My Trips
                    </button>
                    <button onClick={logout} className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}