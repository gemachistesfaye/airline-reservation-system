import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserBookings, cancelBooking } from "../services/api";
import { useToast } from "../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Calendar, MapPin, Ticket, AlertCircle, X, CheckCircle2, Clock, User, ShieldCheck, CreditCard, ChevronRight, GraduationCap, Briefcase, UserCircle, ArrowRight, PlaneTakeoff, Info } from "lucide-react";

export default function Dashboard() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    getUserBookings()
      .then(res => setBookings(res.data))
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setCancellingId(id);
    try {
      const res = await cancelBooking(id);
      showToast(res.message);
      setBookings(bookings.map(b => b.booking_id === id ? { ...b, status: 'Cancelled' } : b));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
        <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-600" size={24} />
      </div>
      <p className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Preparing your dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
          
          {/* DASHBOARD SIDEBAR */}
          <aside className="space-y-6">
             <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-blue-900/5 text-center relative overflow-hidden">
                <div className="w-20 h-20 bg-primary-600 text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-lg font-black text-2xl">
                   {user.name.charAt(0)}
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">{user.name}</h3>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{user.email}</p>

                <div className="mt-8 space-y-2">
                   <button 
                     className="w-full flex items-center justify-between p-4 rounded-xl bg-primary-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-500/20"
                   >
                      <div className="flex items-center gap-3"><Ticket size={16}/> Overview</div>
                      <ChevronRight size={14} />
                   </button>
                   <button 
                     onClick={() => navigate('/profile')}
                     className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900 font-black text-xs uppercase tracking-widest transition-all"
                   >
                      <div className="flex items-center gap-3"><User size={16}/> Profile Settings</div>
                      <ChevronRight size={14} />
                   </button>
                </div>
             </div>

             <div className="bg-gray-900 text-white rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10"><ShieldCheck size={100}/></div>
                <h4 className="font-black mb-4 relative z-10 flex items-center gap-2"><Briefcase size={16}/> Account Type</h4>
                <div className="relative z-10 bg-white/10 px-4 py-3 rounded-xl border border-white/10">
                   <p className="text-[10px] font-black uppercase tracking-widest text-primary-400 mb-1">Status</p>
                   <p className="font-black text-sm uppercase tracking-widest">{user.user_type} Traveler</p>
                </div>
             </div>
          </aside>

          {/* DASHBOARD MAIN CONTENT */}
          <main>
            {/* WELCOME BANNER */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 mb-10">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                   <PlaneTakeoff size={200} />
                </div>
                
                <div className="relative z-10">
                  <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Hello, {user.name.split(' ')[0]}!</h2>
                  <p className="text-gray-500 font-medium max-w-sm leading-relaxed text-sm">
                    Welcome back to your travel hub. You have <span className="text-primary-600 font-black">{bookings.filter(b => b.status !== 'Cancelled').length} active bookings</span>.
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mt-8">
                     <button onClick={() => navigate('/flights')} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all flex items-center gap-2 shadow-lg">
                        Book Flight <Plane size={14} />
                     </button>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-primary-600 text-white p-8 rounded-[2.5rem] shadow-xl shadow-primary-500/20 relative overflow-hidden"
              >
                <div className="absolute bottom-0 right-0 p-6 opacity-20">
                   <CheckCircle2 size={80} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary-200 mb-4">Loyalty Status</p>
                <h3 className="text-2xl font-black mb-6 tracking-tight">Silver Member</h3>
                
                <div className="space-y-4 relative z-10">
                   <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] font-bold text-primary-200 uppercase tracking-widest">Next Tier</span>
                      <span className="text-[10px] font-black">2.4k / 5k</span>
                   </div>
                   <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '45%' }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-white rounded-full"
                      />
                   </div>
                </div>
              </motion.div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-end mb-6 gap-4">
               <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Your Reservations</h3>
               </div>
            </div>

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {bookings.length > 0 ? (
                  bookings.map((b, idx) => (
                    <motion.div
                      key={b.booking_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-lg shadow-blue-900/5 hover:shadow-xl hover:shadow-blue-900/10 transition-all group"
                    >
                      <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                        
                        {/* TRIP ROUTE */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 items-center gap-6 text-center md:text-left w-full">
                          <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Departure</p>
                            <h4 className="text-2xl font-black text-gray-900 tracking-tighter">{b.origin}</h4>
                            <div className="flex items-center justify-center md:justify-start gap-1.5 text-gray-500 font-bold mt-1">
                               <Calendar size={12} className="text-primary-600" />
                               <span className="text-[11px]">{new Date(b.departure_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-center">
                            <div className="text-[9px] font-black text-gray-400 mb-3 uppercase tracking-widest">{b.flight_number}</div>
                            <div className="flex items-center w-full gap-2 px-2">
                              <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                              <div className="flex-1 h-[2px] bg-gray-100 relative">
                                 <Plane className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-600" size={16} />
                              </div>
                              <div className="w-2 h-2 border-2 border-primary-600 rounded-full"></div>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                               <span className="px-2 py-1 bg-gray-900 text-white rounded-md text-[8px] font-black uppercase tracking-widest">Seat {b.seat_number}</span>
                               <span className="px-2 py-1 bg-primary-50 text-primary-600 rounded-md text-[8px] font-black uppercase tracking-widest">{b.seat_class}</span>
                            </div>
                          </div>

                          <div className="md:text-right">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Arrival</p>
                            <h4 className="text-2xl font-black text-gray-900 tracking-tighter">{b.destination}</h4>
                            <div className="flex items-center justify-center md:justify-end gap-1.5 text-gray-500 font-bold mt-1">
                               <Clock size={12} className="text-primary-600" />
                               <span className="text-[11px]">{new Date(b.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>

                        {/* STATUS & ACTIONS */}
                        <div className="flex flex-col items-center lg:items-end gap-4 min-w-[200px] border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8 w-full lg:w-auto">
                          <div className="flex items-center gap-4 w-full lg:justify-end">
                             <div className="text-right flex-1">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                                <p className="text-xl font-black text-gray-900">${parseFloat(b.total_price).toFixed(0)}</p>
                             </div>
                             <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${
                               b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                               b.status === 'Pending Payment' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                               'bg-red-50 text-red-700 border-red-100'
                             }`}>
                               {b.status === 'Confirmed' ? <CheckCircle2 size={12}/> : 
                                b.status === 'Pending Payment' ? <Clock size={12}/> : 
                                <X size={12}/>}
                               {b.status}
                             </div>
                          </div>

                          <div className="flex flex-col gap-2 w-full">
                             {b.status === 'Pending Payment' && (
                               <button
                                 onClick={() => navigate(`/payment/${b.booking_id}`)}
                                 className="w-full bg-amber-500 text-white font-black px-4 py-3 rounded-xl shadow-md hover:bg-amber-600 transition-all flex items-center justify-center gap-2 text-xs"
                               >
                                 <CreditCard size={14} /> Pay Now
                               </button>
                             )}
                             {b.status !== 'Cancelled' && (
                               <button
                                 disabled={cancellingId === b.booking_id}
                                 onClick={() => handleCancel(b.booking_id)}
                                 className="w-full text-gray-400 font-black hover:text-red-600 px-4 py-3 rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2 text-xs"
                               >
                                 <X size={14} /> {cancellingId === b.booking_id ? 'Wait...' : 'Cancel'}
                               </button>
                             )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="bg-white p-16 rounded-[3rem] border border-dashed border-gray-200 text-center shadow-lg shadow-blue-900/5"
                  >
                    <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                      <Plane size={32} className="rotate-[-45deg]" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">No bookings yet</h3>
                    <p className="text-gray-500 mb-8 max-w-xs mx-auto font-medium text-sm">Your travel history is empty. Time to plan your next adventure.</p>
                    <button 
                      onClick={() => navigate('/flights')}
                      className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all flex items-center gap-2 mx-auto text-sm"
                    >
                      Find Flights <ArrowRight size={16} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}