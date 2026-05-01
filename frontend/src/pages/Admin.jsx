import { useEffect, useState } from "react";
import { adminGetStats, adminGetBookings, adminGetUsers, adminGetStudentVerifications, adminReviewStudentVerification } from "../services/api";
import { useToast } from "../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Users, Plane, Ticket, TrendingUp, ShieldCheck, 
  CheckCircle2, XCircle, GraduationCap, Eye, ArrowRight, Clock,
  Calendar, MapPin, Search, Filter, MoreHorizontal
} from "lucide-react";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "dashboard") {
        const res = await adminGetStats();
        setStats(res.data);
      } else if (activeTab === "bookings") {
        const res = await adminGetBookings();
        setBookings(res.data);
      } else if (activeTab === "users") {
        const res = await adminGetUsers();
        setUsers(res.data);
      } else if (activeTab === "verifications") {
        const res = await adminGetStudentVerifications();
        setVerifications(res.data);
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (userId, action) => {
    try {
      const res = await adminReviewStudentVerification(userId, action);
      showToast(res.message);
      loadData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const SidebarItem = ({ id, icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all ${
        activeTab === id 
        ? "bg-primary-600 text-white shadow-xl shadow-primary-500/20" 
        : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <aside className="w-80 bg-white border-r border-gray-100 p-8 flex flex-col pt-32">
        <div className="mb-12 px-6">
           <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">Main Control</h2>
           <div className="space-y-2">
              <SidebarItem id="dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
              <SidebarItem id="bookings" icon={<Ticket size={20}/>} label="All Bookings" />
              <SidebarItem id="users" icon={<Users size={20}/>} label="Passengers" />
              <SidebarItem id="verifications" icon={<GraduationCap size={20}/>} label="Student Verifications" />
           </div>
        </div>
        
        <div className="mt-auto px-6">
           <div className="bg-gray-900 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck size={40}/></div>
              <p className="text-white font-black text-xs mb-1">AeroSpace Admin</p>
              <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">v2.4.0 Stable</p>
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-12 pt-32 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
           <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                {activeTab === "dashboard" && "Platform Overview"}
                {activeTab === "bookings" && "Booking Management"}
                {activeTab === "users" && "Passenger Directory"}
                {activeTab === "verifications" && "Student Approvals"}
              </h1>
              <p className="text-gray-500 font-medium mt-1">Real-time data from across the fleet.</p>
           </div>
           
           <div className="flex gap-4">
              <button className="w-12 h-12 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all shadow-sm">
                 <Search size={20} />
              </button>
              <button className="w-12 h-12 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all shadow-sm">
                 <Filter size={20} />
              </button>
           </div>
        </header>

        <AnimatePresence mode="wait">
           {loading ? (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="h-96 flex flex-col items-center justify-center gap-4"
             >
                <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fetching Data...</p>
             </motion.div>
           ) : (
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.3 }}
             >
               {activeTab === "dashboard" && stats && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                      { label: "Active Passengers", val: stats.users, icon: <Users size={28}/>, color: "blue" },
                      { label: "Live Flights", val: stats.flights, icon: <Plane size={28}/>, color: "indigo" },
                      { label: "Confirmed Bookings", val: stats.bookings, icon: <Ticket size={28}/>, color: "emerald" },
                      { label: "Gross Revenue", val: `$${stats.revenue}`, icon: <TrendingUp size={28}/>, color: "amber" }
                    ].map((s, i) => (
                      <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 relative overflow-hidden group">
                         <div className={`absolute top-0 right-0 p-8 opacity-5 text-gray-900 group-hover:scale-110 transition-transform`}>{s.icon}</div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{s.label}</p>
                         <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{s.val}</h3>
                      </div>
                    ))}
                 </div>
               )}

               {activeTab === "verifications" && (
                 <div className="grid grid-cols-1 gap-6">
                    {verifications.length === 0 ? (
                       <div className="bg-white p-16 rounded-[3rem] text-center border border-gray-100">
                          <CheckCircle2 size={64} className="mx-auto text-emerald-100 mb-6" />
                          <h3 className="text-2xl font-black text-gray-900">All caught up!</h3>
                          <p className="text-gray-500 font-medium">No pending student verifications at the moment.</p>
                       </div>
                    ) : (
                       verifications.map(v => (
                         <div key={v.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                               <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 font-black text-xl shadow-inner">
                                  {v.name.charAt(0)}
                               </div>
                               <div>
                                  <h4 className="font-black text-gray-900 text-lg mb-1">{v.name}</h4>
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{v.email}</p>
                               </div>
                            </div>
                            
                            <div className="flex items-center gap-12">
                               <div className="flex gap-4">
                                  <a 
                                    href={`http://localhost/airline-reservation-system/backend/${v.passport_file}`} 
                                    target="_blank" 
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-100"
                                  >
                                    <Eye size={14}/> Passport
                                  </a>
                                  <a 
                                    href={`http://localhost/airline-reservation-system/backend/${v.student_id_file}`} 
                                    target="_blank" 
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary-600 hover:bg-primary-100"
                                  >
                                    <Eye size={14}/> Student ID
                                  </a>
                               </div>
                               <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleVerification(v.id, 'reject')}
                                    className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
                                  >
                                     <XCircle size={20} />
                                  </button>
                                  <button 
                                    onClick={() => handleVerification(v.id, 'approve')}
                                    className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"
                                  >
                                     <CheckCircle2 size={20} />
                                  </button>
                               </div>
                            </div>
                         </div>
                       ))
                    )}
                 </div>
               )}

               {activeTab === "bookings" && (
                 <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-2xl shadow-blue-900/5">
                    <table className="w-full text-left">
                       <thead className="bg-gray-50/50 border-b border-gray-100">
                          <tr>
                             <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Passenger</th>
                             <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Flight</th>
                             <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Class & Seat</th>
                             <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                             <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Revenue</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {bookings.map(b => (
                            <tr key={b.booking_id} className="group hover:bg-gray-50/50 transition-colors">
                               <td className="px-8 py-6">
                                  <p className="font-black text-gray-900">{b.passenger_name}</p>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TICKET: {b.ticket_number}</p>
                               </td>
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-900 group-hover:bg-white transition-colors shadow-sm"><Plane size={18}/></div>
                                     <div>
                                        <p className="font-black text-gray-900">{b.flight_number}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{b.origin} → {b.destination}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <p className="font-black text-gray-900">{b.seat_class}</p>
                                  <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">SEAT {b.seat_number}</p>
                               </td>
                               <td className="px-8 py-6">
                                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                    b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                  }`}>
                                    {b.status}
                                  </span>
                               </td>
                               <td className="px-8 py-6 text-right">
                                  <p className="font-black text-gray-900 text-lg">${b.total_price}</p>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
               )}
               
               {/* USERS TAB */}
               {activeTab === "users" && (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {users.map(u => (
                      <div key={u.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 relative overflow-hidden group">
                         <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-inner">
                               <Users size={24} />
                            </div>
                            <button className="text-gray-300 hover:text-gray-900"><MoreHorizontal size={20}/></button>
                         </div>
                         <h4 className="text-xl font-black text-gray-900 mb-1">{u.name}</h4>
                         <p className="text-xs font-bold text-gray-400 mb-6">{u.email}</p>
                         
                         <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${u.is_verified ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                               {u.is_verified ? 'Verified' : 'Unverified'}
                            </span>
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${u.user_type === 'student' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                               {u.user_type}
                            </span>
                         </div>
                         
                         <div className="mt-8 pt-8 border-t border-gray-50 flex justify-between items-center">
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Joined</span>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{new Date(u.created_at).toLocaleDateString()}</span>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
             </motion.div>
           )}
        </AnimatePresence>
      </main>
    </div>
  );
}