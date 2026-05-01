import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFlight, getSeats, bookFlight } from "../services/api";
import { useToast } from "../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, MapPin, Calendar, Users, CheckCircle2, Ticket, ArrowRight, ShieldCheck, CreditCard, Star, Crown, Armchair, GraduationCap, ChevronRight, AlertCircle, Info } from "lucide-react";
import SeatSelector from "../components/SeatSelector";

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [flight, setFlight] = useState(null);
  const [seats, setSeats] = useState([]);
  const [classSeatCounts, setClassSeatCounts] = useState({});
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);
  const [step, setStep] = useState(1);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isStudent = user.user_type === 'student';
  const studentVerified = Number(user.student_verified || 0) === 1;

  const classMultipliers = {
    'Economy Class': 1.0,
    'Business Class': 2.5,
    'First Class': 5.0
  };

  useEffect(() => {
    Promise.all([getFlight(id), getSeats(id)])
      .then(([flightRes, seatsRes]) => {
        setFlight(flightRes.data);
        setSeats(seatsRes.data);
        setClassSeatCounts(seatsRes.class_seat_counts || {});
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

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
        <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-600" size={24} />
      </div>
      <p className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Loading Flight Details...</p>
    </div>
  );

  if (successBooking) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 pt-32">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-xl w-full"
        >
          <div className="bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl shadow-blue-900/10 border border-gray-100 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Plane size={120} className="rotate-45" />
            </div>

            <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 size={48} />
            </div>
            
            <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Booking Secured!</h1>
            <p className="text-gray-500 font-medium mb-10 leading-relaxed">
              Excellent choice! We've sent your <strong>Digital Ticket & Secure Payment Link</strong> to <span className="text-primary-600 font-bold">{user.email}</span>. 
              Please complete the payment within 24 hours to finalize your reservation.
            </p>
            
            <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-2xl mb-10 text-left relative overflow-hidden group">
               <div className="absolute top-[-20%] right-[-10%] text-white opacity-5 transform rotate-12 transition-transform group-hover:scale-110 duration-700">
                 <Plane size={240}/>
               </div>
               
               <div className="flex justify-between items-start mb-8 relative z-10">
                  <div>
                    <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">Flight Number</p>
                    <h3 className="text-2xl font-black tracking-tighter">{flight.flight_number}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">Status</p>
                    <span className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary-500/30">
                      Pending Payment
                    </span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8 relative z-10">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cabin Class</p>
                    <p className="font-bold text-lg">{selectedClass}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Selected Seat</p>
                    <p className="font-black text-2xl text-primary-400">{selectedSeat}</p>
                  </div>
               </div>
            </div>

            <button 
              onClick={() => navigate('/dashboard')} 
              className="w-full bg-primary-600 text-white font-black py-5 rounded-2xl hover:bg-primary-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary-500/30 group"
            >
              Manage My Trips <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const baseFare = flight.base_price * (classMultipliers[selectedClass] || 1.0);
  const studentDiscount = isStudent && studentVerified ? baseFare * 0.20 : 0;
  const taxes = (baseFare - studentDiscount) * 0.15;
  const total = baseFare - studentDiscount + taxes;

  const steps = [
    { id: 1, label: "Cabin Class", icon: <Star size={18}/> },
    { id: 2, label: "Seat Selection", icon: <Armchair size={18}/> },
    { id: 3, label: "Review & Pay", icon: <CreditCard size={18}/> }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* PROGRESS WIZARD */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8 md:gap-4 max-w-3xl mx-auto">
          {steps.map((s, idx) => (
            <div key={s.id} className="flex items-center gap-4 group flex-1 last:flex-none">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${step >= s.id ? 'bg-primary-600 text-white shadow-primary-500/30' : 'bg-white text-gray-400 border border-gray-100'}`}>
                {step > s.id ? <CheckCircle2 size={24} /> : s.icon}
              </div>
              <div className="hidden sm:block">
                <p className={`text-[10px] font-black uppercase tracking-widest ${step >= s.id ? 'text-primary-600' : 'text-gray-400'}`}>Step 0{s.id}</p>
                <p className={`font-black text-sm ${step >= s.id ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</p>
              </div>
              {idx < steps.length - 1 && <div className={`hidden md:block h-px w-20 mx-4 ${step > s.id ? 'bg-primary-600' : 'bg-gray-100'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-start">
          
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {/* STEP 1: CLASS SELECTION */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-gray-100"
                >
                  <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                    <div className="text-center md:text-left">
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Select Your Cabin</h3>
                        <p className="text-gray-500 font-medium">Choose the level of comfort for your journey.</p>
                    </div>
                    {isStudent && (
                      <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all ${studentVerified ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                        <GraduationCap size={24} />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest">Student Status</p>
                          <p className="text-xs font-black">{studentVerified ? '20% Discount Active' : 'Verification Pending'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { name: 'First Class', icon: <Crown size={28}/>, multiplier: 5.0, seats: classSeatCounts["First Class"] ?? flight.first_class_seats_avail, color: 'amber', features: ['Private Suite', 'Premium Dining', 'Flat Bed'] },
                      { name: 'Business Class', icon: <Star size={28}/>, multiplier: 2.5, seats: classSeatCounts["Business Class"] ?? flight.business_seats_avail, color: 'indigo', features: ['Wider Seats', 'Lounge Access', 'Extra Bag'] },
                      { name: 'Economy Class', icon: <Armchair size={28}/>, multiplier: 1.0, seats: classSeatCounts["Economy Class"] ?? flight.economy_seats_avail, color: 'emerald', features: ['Modern Seats', 'Standard Meal', 'USB Power'] }
                    ].map(c => (
                      <button
                        key={c.name}
                        disabled={c.seats === 0}
                        onClick={() => setSelectedClass(c.name)}
                        className={`p-8 rounded-[2.5rem] border-2 transition-all text-left group relative overflow-hidden flex flex-col h-full ${selectedClass === c.name ? 'border-primary-600 bg-primary-50/20' : 'border-gray-50 hover:border-gray-200 bg-gray-50/50'} ${c.seats === 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all ${selectedClass === c.name ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/40' : 'bg-white text-gray-400 group-hover:text-primary-600'}`}>
                          {c.icon}
                        </div>
                        <p className="font-black text-gray-900 text-xl mb-1">{c.name}</p>
                        <p className="text-primary-600 font-black text-lg mb-6">${(flight.base_price * c.multiplier).toFixed(0)}</p>
                        
                        <div className="space-y-3 mb-8 flex-grow">
                           {c.features.map(f => (
                             <div key={f} className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-tighter">
                               <CheckCircle2 size={12} className={selectedClass === c.name ? 'text-primary-600' : 'text-gray-300'} /> {f}
                             </div>
                           ))}
                        </div>

                        <div className="mt-auto pt-6 border-t border-gray-100/50 flex justify-between items-center">
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Inventory</span>
                           <span className={`text-[11px] font-black uppercase tracking-widest ${c.seats > 10 ? 'text-emerald-600' : c.seats > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                             {c.seats === 0 ? 'Sold Out' : `${c.seats} Left`}
                           </span>
                        </div>
                        
                        {selectedClass === c.name && (
                          <motion.div layoutId="selection-ring" className="absolute inset-0 border-4 border-primary-600 rounded-[2.5rem] pointer-events-none" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="mt-12 flex justify-end">
                     <button 
                       disabled={!selectedClass}
                       onClick={() => setStep(2)}
                       className="bg-gray-900 text-white font-black px-10 py-5 rounded-2xl hover:bg-black transition-all flex items-center gap-3 shadow-xl shadow-gray-200 disabled:opacity-50"
                     >
                       Continue to Seats <ChevronRight size={20} />
                     </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: SEAT SELECTION */}
              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-gray-100"
                >
                  <div className="text-center md:text-left mb-10">
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Pick Your Spot</h3>
                    <p className="text-gray-500 font-medium">Viewing available seats for <span className="text-primary-600 font-black">{selectedClass}</span></p>
                  </div>

                  <div className="flex justify-center py-16 bg-gray-50/50 rounded-[3rem] border border-gray-100/50">
                    <SeatSelector 
                      seats={seats.filter(s => s.class === selectedClass)} 
                      onSelect={setSelectedSeat} 
                    />
                  </div>

                  <div className="mt-12 flex justify-between">
                     <button 
                       onClick={() => setStep(1)}
                       className="text-gray-500 font-black px-8 py-5 rounded-2xl hover:bg-gray-50 transition-all"
                     >
                       Back to Cabin
                     </button>
                     <button 
                       disabled={!selectedSeat}
                       onClick={() => setStep(3)}
                       className="bg-gray-900 text-white font-black px-10 py-5 rounded-2xl hover:bg-black transition-all flex items-center gap-3 shadow-xl shadow-gray-200 disabled:opacity-50"
                     >
                       Review Booking <ChevronRight size={20} />
                     </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: REVIEW */}
              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-gray-100"
                >
                  <div className="text-center md:text-left mb-10">
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Review Your Trip</h3>
                    <p className="text-gray-500 font-medium">Finalize your details before secure checkout.</p>
                  </div>

                  <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center gap-6">
                           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary-600 shadow-sm">
                              <MapPin size={32} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Itinerary</p>
                              <p className="font-black text-lg text-gray-900">{flight.origin} <ArrowRight size={14} className="inline mx-1 text-gray-300"/> {flight.destination}</p>
                           </div>
                        </div>
                        <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center gap-6">
                           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary-600 shadow-sm">
                              <Calendar size={32} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Departure</p>
                              <p className="font-black text-lg text-gray-900">{new Date(flight.departure_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                           </div>
                        </div>
                     </div>

                     <div className="p-10 bg-primary-600 text-white rounded-[2.5rem] shadow-2xl shadow-primary-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                           <ShieldCheck size={120} />
                        </div>
                        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
                           <div>
                              <p className="text-[10px] font-black text-primary-200 uppercase tracking-widest mb-1">Passenger</p>
                              <p className="font-black text-lg">{user.name}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-primary-200 uppercase tracking-widest mb-1">Flight</p>
                              <p className="font-black text-lg">{flight.flight_number}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-primary-200 uppercase tracking-widest mb-1">Cabin</p>
                              <p className="font-black text-lg">{selectedClass}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-primary-200 uppercase tracking-widest mb-1">Seat</p>
                              <p className="font-black text-3xl">{selectedSeat}</p>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-start gap-4 p-6 bg-amber-50 border border-amber-100 rounded-[2rem] text-amber-800">
                        <AlertCircle size={24} className="shrink-0 mt-1" />
                        <div>
                           <p className="font-black text-sm uppercase tracking-widest mb-1">Important Information</p>
                           <p className="text-sm font-medium leading-relaxed">Please arrive at the airport at least 3 hours before departure. Carry a valid government ID for boarding. Tickets are non-refundable after payment.</p>
                        </div>
                     </div>
                  </div>

                  <div className="mt-12 flex justify-between">
                     <button 
                       onClick={() => setStep(2)}
                       className="text-gray-500 font-black px-8 py-5 rounded-2xl hover:bg-gray-50 transition-all"
                     >
                       Change Seat
                     </button>
                     <button 
                       onClick={handleBook}
                       disabled={bookingLoading}
                       className="bg-primary-600 text-white font-black px-12 py-5 rounded-2xl hover:bg-primary-700 transition-all flex items-center gap-3 shadow-xl shadow-primary-500/30 active:scale-95"
                     >
                       {bookingLoading ? 'Securing Seat...' : 'Finalize Reservation'} <CheckCircle2 size={20} />
                     </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CHECKOUT SIDEBAR */}
          <aside className="sticky top-32">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-blue-900/10 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center shadow-lg">
                    <CreditCard size={20} />
                 </div>
                 <h3 className="text-xl font-black text-gray-900">Fare Summary</h3>
              </div>
              
              <div className="space-y-4 mb-10">
                <div className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border border-gray-100/50 group hover:bg-white hover:border-primary-600/20 transition-all">
                   <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-primary-600 shadow-sm">
                       <Star size={16} />
                    </div>
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Base Fare</span>
                  </div>
                  <span className="text-sm font-black text-gray-900">${baseFare.toFixed(2)}</span>
                </div>

                {isStudent && studentVerified && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex justify-between items-center p-5 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                         <GraduationCap size={16} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">Student (20%)</span>
                    </div>
                    <span className="text-sm font-black">-${studentDiscount.toFixed(2)}</span>
                  </motion.div>
                )}

                <div className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-primary-600 shadow-sm">
                       <ShieldCheck size={16} />
                    </div>
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Taxes & Fees</span>
                  </div>
                  <span className="text-sm font-black text-gray-900">${taxes.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-8 border-t-2 border-dashed border-gray-100">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="text-4xl font-black text-gray-900 tracking-tighter">${total.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Secure Checkout</p>
                     <div className="flex gap-1 justify-end mt-1">
                        <div className="w-4 h-1 bg-gray-100 rounded-full" />
                        <div className="w-8 h-1 bg-primary-600 rounded-full" />
                     </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 flex gap-3 items-start mb-8">
                   <Info size={16} className="text-primary-600 shrink-0 mt-0.5" />
                   <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase tracking-tighter">
                     A payment link will be generated after you confirm. Your seat is temporarily held for 24 hours.
                   </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                 <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                         <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="User" />
                      </div>
                    ))}
                 </div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Join 500+ happy travelers</p>
              </div>
            </motion.div>
          </aside>

        </div>
      </div>
    </div>
  );
}