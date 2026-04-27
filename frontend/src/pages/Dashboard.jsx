import { useEffect, useState } from "react";
import { getUserBookings, cancelBooking } from "../services/api";
import { useToast } from "../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Calendar, MapPin, Ticket, AlertCircle, X, CheckCircle2, Clock } from "lucide-react";

export default function Dashboard() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        
        <header className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="text-4xl font-display font-black text-gray-900 tracking-tight mb-2"
          >
            My <span className="text-primary-600">Journeys</span>
          </motion.h1>
          <p className="text-gray-500 font-medium">Manage your upcoming and past travels with AeroSpace.</p>
        </header>

        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {bookings.length > 0 ? (
              bookings.map((b, idx) => (
                <motion.div
                  key={b.booking_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 overflow-hidden group"
                >
                  <div className="flex flex-col md:flex-row">
                    
                    {/* Status Sidebar (Desktop) */}
                    <div className={`w-2 md:w-3 ${b.status === 'Confirmed' ? 'bg-green-500' : 'bg-red-500'}`} />

                    <div className="flex-1 p-8">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${b.status === 'Confirmed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {b.status === 'Confirmed' ? <CheckCircle2 size={24}/> : <X size={24}/>}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Booking Status</p>
                            <h4 className={`text-lg font-black ${b.status === 'Confirmed' ? 'text-green-600' : 'text-red-600'}`}>{b.status}</h4>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 flex items-center gap-3">
                          <Ticket className="text-primary-600" size={20} />
                          <span className="font-mono font-black text-gray-900">{b.ticket_number}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-10">
                        <div className="text-center md:text-left">
                          <h3 className="text-3xl font-black text-gray-900">{b.origin}</h3>
                          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Departure</p>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="text-xs font-bold text-gray-400 mb-3">{b.flight_number}</div>
                          <div className="flex items-center w-full gap-2">
                             <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                             <div className="flex-1 h-[2px] bg-gray-100 relative">
                               <Plane className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-600" size={20} />
                             </div>
                             <div className="w-2 h-2 border-2 border-primary-600 rounded-full"></div>
                          </div>
                          <div className="text-xs font-bold text-primary-600 mt-3 px-3 py-1 bg-primary-50 rounded-full">
                            Seat {b.seat_number}
                          </div>
                        </div>

                        <div className="text-center md:text-right">
                          <h3 className="text-3xl font-black text-gray-900">{b.destination}</h3>
                          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Arrival</p>
                        </div>
                      </div>

                      <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex gap-8">
                          <div className="flex items-center gap-2 text-gray-500 font-medium">
                            <Calendar size={18} /> {new Date(b.departure_time).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 font-medium">
                            <Clock size={18} /> {new Date(b.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        {b.status === 'Confirmed' && (
                          <button
                            disabled={cancellingId === b.booking_id}
                            onClick={() => handleCancel(b.booking_id)}
                            className="text-red-500 font-bold hover:text-red-600 px-6 py-3 rounded-2xl hover:bg-red-50 transition-all flex items-center gap-2"
                          >
                            <X size={18} /> {cancellingId === b.booking_id ? 'Cancelling...' : 'Cancel Flight'}
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
                className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center shadow-xl shadow-blue-900/5"
              >
                <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plane size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No upcoming trips</h3>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">Looks like you haven't booked any flights yet. Ready to explore?</p>
                <button 
                  onClick={() => navigate('/flights')}
                  className="bg-primary-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all active:scale-95"
                >
                  Find a Flight
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}