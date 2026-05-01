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
      <div className="max-w-6xl mx-auto px-6">
        
        {/* WELCOME BANNER */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-10 md:p-12 rounded-[3.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
               <PlaneTakeoff size={240} />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-5xl font-black text-gray-900 tracking-tight mb-4">Hello, {user.name.split(' ')[0]}!</h2>
              <p className="text-gray-500 font-medium max-w-md leading-relaxed">
                Welcome back to your travel hub. You have <span className="text-primary-600 font-black">{bookings.filter(b => b.status !== 'Cancelled').length} active bookings</span> for your upcoming adventures.
              </p>
              
              <div className="flex flex-wrap gap-4 mt-10">
                 <div className="bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-primary-600 shadow-sm">
                       <Briefcase size={16} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-gray-600">{user.user_type} TRAVELER</span>
                 </div>
                 {user.user_type === 'student' && (
                   <div className={`px-5 py-3 rounded-2xl border flex items-center gap-3 ${Number(user.student_verified) === 1 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                      <GraduationCap size={18} />
                      <span className="text-[11px] font-black uppercase tracking-widest">{Number(user.student_verified) === 1 ? 'Verified Student' : 'Verification Pending'}</span>
                   </div>
                 )}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900 text-white p-10 rounded-[3.5rem] shadow-2xl shadow-gray-200 relative overflow-hidden"
          >
            <div className="absolute bottom-0 right-0 p-8 opacity-10">
               <ShieldCheck size={120} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest text-primary-400 mb-6">Loyalty Status</p>
            <h3 className="text-3xl font-black mb-10 tracking-tight">Silver Member</h3>
            
            <div className="space-y-6 relative z-10">
               <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Next Tier</span>
                  <span className="text-xs font-black">2,450 / 5,000 pts</span>
               </div>
               <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '45%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-primary-500 rounded-full"
                  />
               </div>
               <button 
                onClick={() => navigate('/profile')}
                className="w-full mt-4 bg-white/10 hover:bg-white/20 px-6 py-4 rounded-2xl transition-all flex items-center justify-between group"
               >
                 <span className="text-xs font-black uppercase tracking-widest">Manage Account</span>
                 <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
           <div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">Your Reservations</h3>
              <p className="text-gray-500 font-medium">Manage your upcoming and past flight bookings.</p>
           </div>
           <button 
             onClick={() => navigate('/flights')}
             className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center gap-3 active:scale-95"
           >
              Book New Flight <Plane size={18} />
           </button>
        </div>

        <div className="space-y-8">
          <AnimatePresence mode="popLayout">
            {bookings.length > 0 ? (
              bookings.map((b, idx) => (
                <motion.div
                  key={b.booking_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all group"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
                    
                    {/* TRIP ROUTE */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 items-center gap-8 text-center md:text-left w-full">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Departure</p>
                        <h4 className="text-3xl font-black text-gray-900 tracking-tighter">{b.origin}</h4>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 font-bold mt-1">
                           <Calendar size={14} className="text-primary-600" />
                           <span className="text-xs">{new Date(b.departure_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="text-[10px] font-black text-gray-400 mb-4 uppercase tracking-widest">{b.flight_number}</div>
                        <div className="flex items-center w-full gap-3 px-4">
                          <div className="w-2.5 h-2.5 rounded-full bg-primary-600 shadow-lg shadow-primary-500/50"></div>
                          <div className="flex-1 h-[2px] bg-gray-100 relative">
                             <Plane className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-600" size={24} />
                          </div>
                          <div className="w-2.5 h-2.5 border-2 border-primary-600 rounded-full"></div>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                           <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest">Seat {b.seat_number}</span>
                           <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary-100">{b.seat_class}</span>
                        </div>
                      </div>

                      <div className="md:text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Arrival</p>
                        <h4 className="text-3xl font-black text-gray-900 tracking-tighter">{b.destination}</h4>
                        <div className="flex items-center justify-center md:justify-end gap-2 text-gray-500 font-bold mt-1">
                           <Clock size={14} className="text-primary-600" />
                           <span className="text-xs">{new Date(b.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* STATUS & ACTIONS */}
                    <div className="flex flex-col items-center lg:items-end gap-6 min-w-[280px] border-t lg:border-t-0 lg:border-l border-gray-100 pt-8 lg:pt-0 lg:pl-10 w-full lg:w-auto">
                      <div className="flex items-center gap-4 w-full lg:justify-end">
                         <div className="text-right flex-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ticket Price</p>
                            <p className="text-2xl font-black text-gray-900">${parseFloat(b.total_price).toFixed(0)}</p>
                         </div>
                         <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${
                           b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                           b.status === 'Pending Payment' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                           'bg-red-50 text-red-700 border-red-100'
                         }`}>
                           {b.status === 'Confirmed' ? <CheckCircle2 size={14}/> : 
                            b.status === 'Pending Payment' ? <Clock size={14}/> : 
                            <X size={14}/>}
                           {b.status}
                         </div>
                      </div>

                      <div className="flex items-center gap-3 w-full">
                         {b.status === 'Pending Payment' && (
                           <button
                             onClick={() => navigate(`/payment/${b.booking_id}`)}
                             className="flex-1 bg-amber-500 text-white font-black px-6 py-4 rounded-2xl shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                           >
                             <CreditCard size={18} /> Pay Now
                           </button>
                         )}
                         {b.status !== 'Cancelled' && (
                           <button
                             disabled={cancellingId === b.booking_id}
                             onClick={() => handleCancel(b.booking_id)}
                             className="flex-1 text-gray-400 font-black hover:text-red-600 px-6 py-4 rounded-2xl hover:bg-red-50 transition-all flex items-center justify-center gap-2 group/cancel"
                           >
                             <X size={18} className="group-hover/cancel:rotate-90 transition-transform" /> {cancellingId === b.booking_id ? 'Cancelling...' : 'Cancel Trip'}
                           </button>
                         )}
                         {b.status === 'Cancelled' && (
                           <div className="flex-1 bg-gray-50 text-gray-400 font-black px-6 py-4 rounded-2xl text-center flex items-center justify-center gap-2 italic">
                             <Info size={16} /> Refund in progress
                           </div>
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
                className="bg-white p-24 rounded-[4rem] border border-dashed border-gray-200 text-center shadow-xl shadow-blue-900/5"
              >
                <div className="w-24 h-24 bg-gray-50 text-gray-200 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                  <Plane size={48} className="rotate-[-45deg]" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Adventure awaits you!</h3>
                <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium">You haven't booked any flights yet. Our premium destinations are just a click away.</p>
                <button 
                  onClick={() => navigate('/flights')}
                  className="bg-primary-600 text-white px-12 py-5 rounded-[2rem] font-black shadow-xl shadow-primary-500/30 hover:bg-primary-700 transition-all active:scale-95 flex items-center gap-3 mx-auto"
                >
                  Explore Flights <ArrowRight size={20} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}