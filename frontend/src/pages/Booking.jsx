import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFlight, getSeats, bookFlight } from "../services/api";
import { useToast } from "../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, MapPin, Calendar, Users, CheckCircle2, Ticket, ArrowRight, ShieldCheck, CreditCard } from "lucide-react";
import SeatSelector from "../components/SeatSelector";

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [flight, setFlight] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [successTicket, setSuccessTicket] = useState(null);

  useEffect(() => {
    Promise.all([getFlight(id), getSeats(id)])
      .then(([flightRes, seatsRes]) => {
        setFlight(flightRes.data);
        setSeats(seatsRes.data);
      })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!selectedSeat) return showToast("Please select a seat", "warning");
    setBookingLoading(true);
    try {
      const res = await bookFlight({ flight_id: id, seat_number: selectedSeat });
      setSuccessTicket(res.ticket);
      showToast(res.message);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  if (!flight) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6"><Plane size={40} className="rotate-45"/></div>
      <h2 className="text-2xl font-black text-gray-900 mb-2">Flight Not Found</h2>
      <p className="text-gray-500 mb-8">We couldn't retrieve the details for this journey. It may have been cancelled or moved.</p>
      <button onClick={() => navigate('/flights')} className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold">Return to Flights</button>
    </div>
  );

  if (successTicket) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-900/10">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-4xl font-display font-black text-gray-900 mb-4 tracking-tight">Sky-Bound!</h1>
          <p className="text-gray-500 font-medium mb-10">Your journey with AeroSpace has been confirmed. Get ready to soar.</p>
          
          <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-2xl mb-10 text-left relative overflow-hidden">
             <div className="absolute top-[-10%] right-[-10%] text-white opacity-5 transform rotate-12"><Plane size={200}/></div>
             <p className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-2">Electronic Ticket</p>
             <h3 className="text-2xl font-black mb-6">{successTicket}</h3>
             <div className="flex justify-between border-t border-white/10 pt-6">
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Passenger</p>
                  <p className="font-bold">Valued Member</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Seat</p>
                  <p className="font-bold text-primary-400">{selectedSeat}</p>
               </div>
             </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/dashboard')} className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200">
              View My Trips
            </button>
            <button onClick={() => navigate('/')} className="w-full text-gray-500 font-bold py-4 hover:text-gray-900 transition-all">
              Return Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
          
          <div className="space-y-8">
            {/* Flight Summary Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-10 rounded-[3rem] shadow-xl shadow-blue-900/5 border border-gray-100"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20"><Plane size={24}/></div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{flight.flight_number}</h2>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Premium Flight Selection</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Available Seats</p>
                  <p className="text-2xl font-black text-primary-600">{flight.available_seats}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
                <div className="text-center md:text-left">
                  <h3 className="text-4xl font-black text-gray-900">{flight.origin}</h3>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Departure Point</p>
                </div>
                <div className="flex flex-col items-center">
                   <div className="h-[2px] w-full bg-gray-100 relative">
                     <Plane className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-600" size={24} />
                   </div>
                   <p className="text-[10px] font-black text-primary-600 mt-4 bg-primary-50 px-3 py-1 rounded-full uppercase tracking-tighter">Direct Service</p>
                </div>
                <div className="text-center md:text-right">
                  <h3 className="text-4xl font-black text-gray-900">{flight.destination}</h3>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Destination</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mt-10 pt-10 border-t border-gray-50">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-gray-50 text-gray-500 rounded-xl flex items-center justify-center"><Calendar size={20}/></div>
                   <div>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Departure Date</p>
                     <p className="font-bold text-gray-900">{new Date(flight.departure_time).toLocaleDateString()}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-gray-50 text-gray-500 rounded-xl flex items-center justify-center"><Users size={20}/></div>
                   <div>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Class</p>
                     <p className="font-bold text-gray-900">Premium Economy</p>
                   </div>
                 </div>
              </div>
            </motion.div>

            {/* SEAT SELECTOR */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-10 rounded-[3rem] shadow-xl shadow-blue-900/5 border border-gray-100"
            >
              <div className="mb-10 text-center md:text-left">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Cabin Layout</h3>
                <p className="text-gray-400 font-medium text-sm">Please choose your preferred seat for this journey.</p>
              </div>
              <div className="flex justify-center py-10 bg-gray-50 rounded-[2.5rem] border border-gray-100/50">
                <SeatSelector seats={seats} onSelect={setSelectedSeat} />
              </div>
            </motion.div>
          </div>

          {/* CHECKOUT SIDEBAR */}
          <aside className="sticky top-32 space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-8">Reservation Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-green-600" size={20} />
                    <span className="text-sm font-bold text-gray-600">Selected Seat</span>
                  </div>
                  <span className="text-lg font-black text-primary-600">{selectedSeat || "None"}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <CreditCard className="text-blue-600" size={20} />
                    <span className="text-sm font-bold text-gray-600">Fare Basis</span>
                  </div>
                  <span className="text-sm font-black text-gray-900">Standard</span>
                </div>
              </div>

              <div className="border-t border-gray-50 pt-6 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 font-medium">Subtotal</span>
                  <span className="text-gray-900 font-bold">$249.00</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-400 font-medium">Taxes & Fees</span>
                  <span className="text-gray-900 font-bold">$42.15</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-black">Total Due</span>
                  <span className="text-3xl font-black text-gray-900">$291.15</span>
                </div>
              </div>

              <button
                disabled={!selectedSeat || bookingLoading}
                onClick={handleBook}
                className="w-full bg-primary-600 text-white font-bold py-5 rounded-[1.5rem] shadow-xl shadow-primary-500/30 hover:bg-primary-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                {bookingLoading ? "Securing Flight..." : (
                  <>Confirm & Book Journey <ArrowRight size={20}/></>
                )}
              </button>
              
              <p className="text-[10px] text-gray-400 text-center mt-6 uppercase tracking-widest font-bold">
                🔒 Secure SSL Encryption Protected
              </p>
            </motion.div>
          </aside>

        </div>

      </div>
    </div>
  );
}