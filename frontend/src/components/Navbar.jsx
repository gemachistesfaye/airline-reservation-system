import { Link, useNavigate, useLocation } from "react-router-dom";
import { Plane, User, LayoutDashboard, LogOut, Home, Compass, Users, Settings, Briefcase, Ticket, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="fixed top-0 w-full z-[100] px-6 py-5">
      <nav className="max-w-7xl mx-auto bg-white/80 backdrop-blur-2xl rounded-[2.5rem] px-8 py-3 flex justify-between items-center shadow-2xl shadow-blue-900/10 border border-white/50">
        
        <h1 className="font-display font-black text-2xl text-gray-900 tracking-tighter flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-11 h-11 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30"
          >
            <Plane size={24} className="rotate-[-45deg]" />
          </motion.div>
          <span className="hidden md:block bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">AeroSpace</span>
        </h1>

        <div className="flex items-center gap-2 md:gap-8 font-black text-gray-400 text-[11px] uppercase tracking-widest">
          {/* COMMON LINKS */}
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/" className={`flex items-center gap-2 hover:text-primary-600 transition-colors ${isActive('/') ? 'text-primary-600' : ''}`}>
              <Home size={16} /> Home
            </Link>
            <Link to="/flights" className={`flex items-center gap-2 hover:text-primary-600 transition-colors ${isActive('/flights') ? 'text-primary-600' : ''}`}>
              <Compass size={16} /> Flights
            </Link>
          </div>

          {!isAuth ? (
             <Link to="/login" className="bg-primary-600 text-white hover:bg-primary-700 px-8 py-3 rounded-2xl shadow-xl shadow-primary-500/20 transition-all active:scale-95 flex items-center gap-2">
               Sign In <User size={16} />
             </Link>
          ) : (
            <div className="flex items-center gap-4">
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="group flex items-center gap-3 p-1 pr-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all border border-gray-100/50"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/20 font-black text-sm">
                    {String(user.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-[10px] text-gray-400 uppercase leading-none mb-1">Welcome back</p>
                    <p className="text-gray-900 font-black text-xs leading-none normal-case">{user.name?.split(' ')[0]}</p>
                  </div>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-72 rounded-[2rem] border border-gray-100 bg-white p-2 shadow-2xl shadow-blue-900/10 overflow-hidden"
                    >
                      <div className="p-5 bg-gray-50 rounded-[1.5rem] mb-2">
                        <div className="flex items-center gap-3 mb-3">
                           <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center font-black text-primary-600 shadow-sm">
                             {String(user.name || "U").charAt(0).toUpperCase()}
                           </div>
                           <div>
                              <div className="font-black text-gray-900 leading-none mb-1">{user.name}</div>
                              <div className="text-[10px] text-gray-400 font-bold break-all">{user.email}</div>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-primary-100 text-primary-700'}`}>
                            {role}
                          </span>
                          {user.user_type === 'student' && (
                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${Number(user.student_verified) === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
                              {Number(user.student_verified) === 1 ? 'Verified Student' : 'Student'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <button onClick={() => { setProfileOpen(false); navigate("/profile"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-50 hover:text-primary-600 transition-all">
                          <User size={16} /> Profile Settings
                        </button>
                        <button onClick={() => { setProfileOpen(false); navigate("/dashboard"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-50 hover:text-primary-600 transition-all">
                          <Ticket size={16} /> My Reservations
                        </button>
                        {role === 'admin' && (
                          <button onClick={() => { setProfileOpen(false); navigate("/admin"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-50 hover:text-primary-600 transition-all">
                            <LayoutDashboard size={16} /> Control Panel
                          </button>
                        )}
                        <div className="h-px bg-gray-50 mx-2 my-1" />
                        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black text-red-600 hover:bg-red-50 transition-all">
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

  );
}