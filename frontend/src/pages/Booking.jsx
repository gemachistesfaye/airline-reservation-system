import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFlight, getSeats, bookFlight } from "../services/api";
import { useToast } from "../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, MapPin, Calendar, Users, CheckCircle2, Ticket, ArrowRight, ShieldCheck, CreditCard, Star, Crown, Armchair } from "lucide-react";
import SeatSelector from "../components/SeatSelector";

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [flight, setFlight] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);

  const prices = {
    'Economy': 249,
    'Business': 599,
    'First Class': 1249
  };

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
    if (!selectedSeat || !selectedClass) return showToast("Selection incomplete", "warning");
    setBookingLoading(true);
    try {
      const res = await bookFlight({ 
        flight_id: id, 
        seat_number: selectedSeat, 
        seat_class: selectedClass 
      });
      setSuccessBooking(res.booking_id);
      showToast(res.message);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  if (successBooking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-24 h-24 bg-primary-50 text-primary-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary-900/10">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-4xl font-display font-black text-gray-900 mb-4 tracking-tight">Booking Saved!</h1>
          <p className="text-gray-500 font-medium mb-10">We've sent a <strong>Secure Payment Link</strong> to your registered Gmail. Please complete the payment to confirm your seat.</p>
          
          <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-2xl mb-10 text-left relative overflow-hidden">
             <div className="absolute top-[-10%] right-[-10%] text-white opacity-5 transform rotate-12"><Plane size={200}/></div>
             <p className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-2">Reservation Status</p>
             <h3 className="text-2xl font-black mb-6">Pending Payment</h3>
             <div className="flex justify-between border-t border-white/10 pt-6">
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Class</p>
                  <p className="font-bold">{selectedClass}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Seat</p>
                  <p className="font-bold text-primary-400">{selectedSeat}</p>
               </div>
             </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/dashboard')} className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200">
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const basePrice = prices[selectedClass] || 0;
  const taxes = basePrice * 0.15;
  const total = basePrice + taxes;

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
          
          <div className="space-y-8">
            {/* Step 1: Class Selection */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-10 rounded-[3rem] shadow-xl shadow-blue-900/5 border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Star size={24}/></div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Step 1: Choose Your Class</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'First Class', icon: <Crown size={24}/>, price: 1249, seats: flight.first_class_seats_avail, color: 'amber' },
                  { name: 'Business', icon: <Star size={24}/>, price: 599, seats: flight.business_seats_avail, color: 'indigo' },
                  { name: 'Economy', icon: <Armchair size={24}/>, price: 249, seats: flight.economy_seats_avail, color: 'emerald' }
                ].map(c => (
                  <button
                    key={c.name}
                    onClick={() => { setSelectedClass(c.name); setSelectedSeat(null); }}
                    className={`p-6 rounded-[2rem] border-2 transition-all text-left group ${selectedClass === c.name ? 'border-primary-600 bg-primary-50/30' : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${selectedClass === c.name ? 'bg-primary-600 text-white' : 'bg-white text-gray-400 group-hover:text-gray-600'}`}>
                      {c.icon}
                    </div>
                    <p className="font-black text-gray-900 text-lg">{c.name}</p>
                    <p className="text-primary-600 font-bold text-sm mb-4">${c.price}</p>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                       <span>Availability</span>
                       <span className={c.seats > 0 ? 'text-green-600' : 'text-red-500'}>{c.seats} left</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Step 2: Seat Selector (Only visible after class selection) */}
            <AnimatePresence>
              {selectedClass && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white p-10 rounded-[3rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden"
                >
                  <div className="mb-10 text-center md:text-left">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Step 2: Select Your {selectedClass} Seat</h3>
                    <p className="text-gray-400 font-medium text-sm">Interactive map showing available seats in your selected tier.</p>
                  </div>
                  <div className="flex justify-center py-10 bg-gray-50 rounded-[2.5rem] border border-gray-100/50">
                    <SeatSelector 
                      seats={seats.filter(s => s.class === selectedClass)} 
                      onSelect={setSelectedSeat} 
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CHECKOUT SIDEBAR */}
          <aside className="sticky top-32 space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-8">Reservation Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                   <div className="flex items-center gap-3">
                    <Star className="text-amber-500" size={20} />
                    <span className="text-sm font-bold text-gray-600">Travel Class</span>
                  </div>
                  <span className="text-sm font-black text-gray-900">{selectedClass || "Select Step 1"}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-green-600" size={20} />
                    <span className="text-sm font-bold text-gray-600">Seat Number</span>
                  </div>
                  <span className="text-lg font-black text-primary-600">{selectedSeat || "Select Step 2"}</span>
                </div>
              </div>

              {selectedClass && (
                <div className="border-t border-gray-50 pt-6 mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 font-medium">{selectedClass} Fare</span>
                    <span className="text-gray-900 font-bold">${basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-400 font-medium">Taxes & Fees (15%)</span>
                    <span className="text-gray-900 font-bold">${taxes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-black">Total Amount</span>
                    <span className="text-3xl font-black text-gray-900">${total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button
                disabled={!selectedSeat || !selectedClass || bookingLoading}
                onClick={handleBook}
                className="w-full bg-primary-600 text-white font-bold py-5 rounded-[1.5rem] shadow-xl shadow-primary-500/30 hover:bg-primary-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                {bookingLoading ? "Initializing Payment..." : (
                  <>Create Booking & Pay <ArrowRight size={20}/></>
                )}
              </button>
              
              <p className="text-[10px] text-gray-400 text-center mt-6 uppercase tracking-widest font-bold">
                💳 Secure Payment via Gmail Link
              </p>
            </motion.div>
          </aside>

        </div>
      </div>
    </div>
  );
}