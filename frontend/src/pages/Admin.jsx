import { useEffect, useState } from "react";
import { adminGetStats, adminGetAnalytics, adminGetBookings, getFlights, adminAddFlight, adminUpdateFlight, adminDeleteFlight, adminGetUsers, adminToggleUserStatus, adminGetStudentVerifications, adminReviewStudentVerification } from "../services/api";
import { useToast } from "../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Plane, Users, Calendar, TrendingUp, Trash2, Edit3, X, ArrowRight, DollarSign, BarChart3, Armchair, Star, Crown, GraduationCap, ExternalLink, AlertCircle, CheckCircle2 } from "lucide-react";

const API_BASE = "http://localhost/airline-reservation-system/backend";

export default function Admin() {
  const { showToast } = useToast();
  const [stats, setStats] = useState({ flights: 0, bookings: 0, passengers: 0, revenue: 0 });
  const [analytics, setAnalytics] = useState({ occupancy: [], classUsage: {}, trends: [] });
  const [flights, setFlights] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [studentVerifications, setStudentVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Tiered Form State
  const [flightNumber, setFlightNumber] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [status, setStatus] = useState("Scheduled");
  const [basePrice, setBasePrice] = useState(100);
  const [ecoSeats, setEcoSeats] = useState(40);
  const [busSeats, setBusSeats] = useState(12);
  const [fstSeats, setFstSeats] = useState(6);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes, bookRes, flyRes, usersRes, studentVerifyRes] = await Promise.all([
        adminGetStats(), adminGetAnalytics(), adminGetBookings(), getFlights(), adminGetUsers(), adminGetStudentVerifications()
      ]);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
      setAdminBookings(bookRes.data);
      setFlights(flyRes.data);
      setAdminUsers(usersRes.data);
      setStudentVerifications(studentVerifyRes.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setEditingFlight(null);
    setFlightNumber(""); setOrigin(""); setDestination("");
    setDepartureTime(""); setArrivalTime(""); setStatus("Scheduled");
    setBasePrice(100);
    setEcoSeats(40); setBusSeats(12); setFstSeats(6);
  };

  const handleEditClick = (f) => {
    setEditingFlight(f);
    setFlightNumber(f.flight_number);
    setOrigin(f.origin);
    setDestination(f.destination);
    setDepartureTime(f.departure_time ? f.departure_time.replace(' ', 'T') : "");
    setArrivalTime(f.arrival_time ? f.arrival_time.replace(' ', 'T') : "");
    setStatus(f.status);
    setBasePrice(f.base_price || 100);
    setEcoSeats(f.economy_seats_total || 40);
    setBusSeats(f.business_seats_total || 12);
    setFstSeats(f.first_class_seats_total || 6);
    setActiveTab("flights");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = { 
        flight_number: flightNumber, origin, destination, 
        departure_time: departureTime, arrival_time: arrivalTime, status,
        base_price: basePrice,
        economy_seats: ecoSeats, business_seats: busSeats, first_class_seats: fstSeats
      };
      let res = editingFlight 
        ? await adminUpdateFlight({ ...payload, flight_id: editingFlight.flight_id })
        : await adminAddFlight(payload);
      showToast(res.message);
      resetForm();
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUser = async (id) => {
    setActionLoading(true);
    try {
      const res = await adminToggleUserStatus(id);
      showToast(res.message);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirm deletion?")) return;
    setActionLoading(true);
    try {
      const res = await adminDeleteFlight(id);
      showToast(res.message);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStudentVerification = async (id, action) => {
    setActionLoading(true);
    try {
      const res = await adminReviewStudentVerification(id, action);
      showToast(res.message);
      fetchData();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
        <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-600" size={24} />
      </div>
      <p className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Accessing Control Center...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      
      {/* SIDEBAR */}
      <aside className="w-80 bg-white border-r border-gray-100 flex flex-col p-8 pt-32 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-4 mb-12 px-4 group cursor-pointer">
           <div className="w-11 h-11 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-2xl group-hover:bg-primary-600 transition-colors"><Plane size={24} className="rotate-[-45deg]" /></div>
           <div>
             <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">Control Panel</h2>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Authorization</p>
           </div>
        </div>
        
        <nav className="space-y-2 flex-1">
          {[
            { id: "overview", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
            { id: "flights", icon: <Plane size={20} />, label: "Fleet Management" },
            { id: "bookings", icon: <Calendar size={20} />, label: "Passenger Manifest" },
            { id: "users", icon: <Users size={20} />, label: "User Accounts" },
            { id: "students", icon: <GraduationCap size={20} />, label: "Student IDs", badge: studentVerifications.filter(v => v.student_verification_status === 'pending').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black transition-all ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-2xl shadow-primary-500/30' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-4">
                {tab.icon}
                <span className="text-sm">{tab.label}</span>
              </div>
              {tab.badge > 0 && <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black ${activeTab === tab.id ? 'bg-white text-primary-600' : 'bg-red-500 text-white'}`}>{tab.badge}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-12 pt-32">
        <div className="max-w-7xl mx-auto">
          
          <AnimatePresence mode="wait">
            
            {activeTab === "overview" && (
              <motion.div key="ov" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
                   {[
                     { label: 'Active Flights', val: stats.flights, icon: <Plane size={24}/>, color: 'blue' },
                     { label: 'Total Bookings', val: stats.bookings, icon: <Calendar size={24}/>, color: 'indigo' },
                     { label: 'Total Revenue', val: `$${parseFloat(stats.revenue).toLocaleString()}`, icon: <DollarSign size={24}/>, color: 'emerald' },
                     { label: 'Registered Users', val: stats.passengers, icon: <Users size={24}/>, color: 'purple' }
                   ].map(s => (
                     <div key={s.label} className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-gray-100 flex flex-col gap-6 group hover:border-primary-600/20 transition-all">
                        <div className={`w-14 h-14 bg-${s.color}-50 text-${s.color}-600 rounded-[1.5rem] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>{s.icon}</div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                          <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{s.val}</h3>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12">
                   {/* ANALYTICS */}
                   <div className="space-y-12">
                      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100">
                        <div className="flex items-center justify-between mb-10">
                          <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-4"><TrendingUp className="text-primary-600" size={28} /> Route Performance</h3>
                          <div className="bg-gray-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400">Live Occupancy</div>
                        </div>
                        <div className="space-y-8">
                            {analytics.occupancy.map(f => (
                            <div key={f.flight_number}>
                                <div className="flex justify-between text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3">
                                    <span>{f.flight_number} • {f.origin} <ArrowRight size={10} className="inline mx-1"/> {f.destination}</span>
                                    <span className={f.occupancy_rate > 80 ? 'text-emerald-600' : 'text-primary-600'}>{f.occupancy_rate}% Full</span>
                                </div>
                                <div className="h-4 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${f.occupancy_rate}%` }}
                                        transition={{ duration: 1 }}
                                        className={`h-full rounded-full ${f.occupancy_rate > 80 ? 'bg-emerald-500' : 'bg-primary-600 shadow-lg shadow-primary-500/20'}`} 
                                    />
                                </div>
                            </div>
                            ))}
                        </div>
                      </div>

                      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100">
                        <div className="flex items-center justify-between mb-10">
                           <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-4"><BarChart3 className="text-primary-600" size={28} /> Service Distribution</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { label: 'Economy', count: analytics.classUsage.economy_booked, color: 'emerald', icon: <Armchair size={20}/> },
                                { label: 'Business', count: analytics.classUsage.business_booked, color: 'indigo', icon: <Star size={20}/> },
                                { label: 'First Class', count: analytics.classUsage.first_booked, color: 'amber', icon: <Crown size={20}/> }
                            ].map(item => (
                                <div key={item.label} className="text-center p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100/50 group hover:bg-white hover:shadow-2xl transition-all">
                                    <div className={`w-14 h-14 bg-${item.color}-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-${item.color}-500/20 group-hover:scale-110 transition-transform`}>{item.icon}</div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{item.label}</p>
                                    <h4 className="text-3xl font-black text-gray-900 mb-1">{item.count || 0}</h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Reservations</p>
                                </div>
                            ))}
                        </div>
                      </div>
                   </div>

                   {/* RECENT FEED */}
                   <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100 overflow-hidden relative">
                     <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                        <Users size={200} />
                     </div>
                     <h3 className="text-2xl font-black text-gray-900 mb-10 flex items-center gap-4 relative z-10"><Calendar className="text-primary-600" size={28} /> Recent Manifest</h3>
                     <div className="space-y-5 relative z-10">
                       {adminBookings.slice(0, 10).map(b => (
                         <div key={b.booking_id} className="flex justify-between items-center p-5 bg-gray-50 rounded-[2rem] border border-gray-100 hover:bg-white hover:shadow-xl transition-all group">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-primary-600 shadow-sm border border-gray-100 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">{b.flight_number}</div>
                               <div>
                                   <div className="text-sm font-black text-gray-900">{b.user_name}</div>
                                   <div className="text-[10px] font-bold text-gray-400 uppercase">{b.seat_class.split(' ')[0]} • Seat {b.seat_number}</div>
                               </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-black text-gray-900">${parseFloat(b.total_price).toFixed(0)}</div>
                                <span className={`px-3 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest ${b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{b.status}</span>
                            </div>
                         </div>
                       ))}
                     </div>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === "flights" && (
              <motion.div key="fl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                 <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100">
                    <div className="flex justify-between items-center mb-10">
                      <div>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">{editingFlight ? "Update Flight Path" : "Establish New Route"}</h3>
                        <p className="text-gray-500 font-medium">Configure route parameters and tiered cabin availability.</p>
                      </div>
                      {editingFlight && <button onClick={resetForm} className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all"><X size={24}/></button>}
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <div className="space-y-3"><label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Flight Number</label><input className="w-full px-6 py-5 bg-gray-50 border-none rounded-[1.5rem] font-black text-gray-900 focus:ring-4 focus:ring-primary-600/5 transition-all outline-none" value={flightNumber} onChange={e => setFlightNumber(e.target.value)} required placeholder="AS700" /></div>
                      <div className="space-y-3"><label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Origin City</label><input className="w-full px-6 py-5 bg-gray-50 border-none rounded-[1.5rem] font-black text-gray-900 focus:ring-4 focus:ring-primary-600/5 transition-all outline-none" value={origin} onChange={e => setOrigin(e.target.value)} required placeholder="London" /></div>
                      <div className="space-y-3"><label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Destination City</label><input className="w-full px-6 py-5 bg-gray-50 border-none rounded-[1.5rem] font-black text-gray-900 focus:ring-4 focus:ring-primary-600/5 transition-all outline-none" value={destination} onChange={e => setDestination(e.target.value)} required placeholder="Dubai" /></div>
                      <div className="space-y-3"><label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Departure Schedule</label><input type="datetime-local" className="w-full px-6 py-5 bg-gray-50 border-none rounded-[1.5rem] font-black text-gray-900 focus:ring-4 focus:ring-primary-600/5 transition-all outline-none" value={departureTime} onChange={e => setDepartureTime(e.target.value)} required /></div>
                      <div className="space-y-3"><label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Arrival Schedule</label><input type="datetime-local" className="w-full px-6 py-5 bg-gray-50 border-none rounded-[1.5rem] font-black text-gray-900 focus:ring-4 focus:ring-primary-600/5 transition-all outline-none" value={arrivalTime} onChange={e => setArrivalTime(e.target.value)} required /></div>
                      <div className="space-y-3"><label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Base Price ($)</label><input type="number" className="w-full px-6 py-5 bg-gray-50 border-none rounded-[1.5rem] font-black text-gray-900 focus:ring-4 focus:ring-primary-600/5 transition-all outline-none" value={basePrice} onChange={e => setBasePrice(e.target.value)} required /></div>
                      
                      <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-gray-100 mt-4">
                         <div className="space-y-3"><label className="text-[11px] font-black text-amber-600 uppercase flex items-center gap-3 tracking-widest"><Crown size={16}/> First Class Capacity</label><input type="number" className="w-full px-6 py-5 bg-amber-50/50 border-none rounded-[1.5rem] font-black text-gray-900 focus:ring-4 focus:ring-amber-500/20 transition-all outline-none" value={fstSeats} onChange={e => setFstSeats(e.target.value)} required /></div>
                         <div className="space-y-3"><label className="text-[11px] font-black text-indigo-600 uppercase flex items-center gap-3 tracking-widest"><Star size={16}/> Business Capacity</label><input type="number" className="w-full px-6 py-5 bg-indigo-50/50 border-none rounded-[1.5rem] font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none" value={busSeats} onChange={e => setBusSeats(e.target.value)} required /></div>
                         <div className="space-y-3"><label className="text-[11px] font-black text-emerald-600 uppercase flex items-center gap-3 tracking-widest"><Armchair size={16}/> Economy Capacity</label><input type="number" className="w-full px-6 py-5 bg-emerald-50/50 border-none rounded-[1.5rem] font-black text-gray-900 focus:ring-4 focus:ring-emerald-500/20 transition-all outline-none" value={ecoSeats} onChange={e => setEcoSeats(e.target.value)} required /></div>
                      </div>

                      <div className="col-span-full pt-10">
                        <button type="submit" disabled={actionLoading} className="w-full bg-primary-600 text-white font-black py-6 rounded-[2.5rem] shadow-2xl shadow-primary-500/30 hover:bg-primary-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                          {actionLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : editingFlight ? "Update Deployment Data" : "Initiate Fleet Expansion"}
                        </button>
                      </div>
                    </form>
                 </div>

                 <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100">
                    <h3 className="text-3xl font-black text-gray-900 mb-10 tracking-tight">Active Fleet Inventory</h3>
                    <div className="grid grid-cols-1 gap-6">
                      {flights.map(f => (
                        <div key={f.flight_id} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row items-center justify-between hover:bg-white hover:shadow-2xl hover:border-primary-600/10 transition-all group">
                          <div className="flex items-center gap-8 mb-6 md:mb-0">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center font-black text-primary-600 shadow-xl border border-gray-100 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">{f.flight_number}</div>
                            <div>
                                <div className="font-black text-gray-900 text-xl tracking-tight mb-1">{f.origin} <ArrowRight className="inline mx-2 text-gray-300" size={18}/> {f.destination}</div>
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Calendar size={14}/> {new Date(f.departure_time).toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 w-full md:w-auto">
                             <div className="text-right mr-4 hidden xl:block">
                                 <p className="text-2xl font-black text-gray-900 tracking-tighter">${parseFloat(f.base_price).toFixed(0)}</p>
                                 <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{f.available_seats} SEATS OPEN</p>
                             </div>
                             <div className="flex gap-3 w-full md:w-auto">
                                <button onClick={() => handleEditClick(f)} className="flex-1 md:flex-none p-5 bg-white text-gray-900 rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-900 hover:text-white transition-all"><Edit3 size={20}/></button>
                                <button onClick={() => handleDelete(f.flight_id)} className="flex-1 md:flex-none p-5 bg-white text-red-500 rounded-2xl shadow-sm border border-gray-100 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20}/></button>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === "bookings" && (
              <motion.div key="bk" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100 overflow-hidden">
                  <h3 className="text-3xl font-black text-gray-900 mb-10 tracking-tight">Passenger Intelligence Manifest</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="pb-8 px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Passenger Entity</th>
                          <th className="pb-8 px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Flight / Tier</th>
                          <th className="pb-8 px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Seat</th>
                          <th className="pb-8 px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Revenue</th>
                          <th className="pb-8 px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Confirmation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {adminBookings.map(b => (
                          <tr key={b.booking_id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-8 px-4">
                                <div className="font-black text-gray-900 text-base">{b.user_name}</div>
                                <div className="text-[10px] text-primary-600 font-black uppercase tracking-widest">{b.ticket_number}</div>
                            </td>
                            <td className="py-8 px-4">
                                <div className="font-black text-gray-700">{b.flight_number}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{b.seat_class}</div>
                            </td>
                            <td className="py-8 px-4 text-center">
                                <span className="bg-gray-900 text-white font-black px-5 py-2 rounded-[1rem] text-[10px] tracking-widest shadow-xl shadow-gray-200">{b.seat_number}</span>
                            </td>
                            <td className="py-8 px-4">
                                <div className="font-black text-gray-900 text-lg">${parseFloat(b.total_price).toFixed(2)}</div>
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${b.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{b.payment_status}</span>
                            </td>
                            <td className="py-8 px-4 text-right">
                                <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border ${b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{b.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div key="usr" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100">
                  <h3 className="text-3xl font-black text-gray-900 mb-10 tracking-tight">Active User Directory</h3>
                  <div className="grid grid-cols-1 gap-6">
                    {adminUsers.map(u => (
                      <div key={u.id} className="p-8 bg-gray-50 rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between border border-gray-100 hover:bg-white hover:shadow-2xl transition-all group">
                        <div className="flex items-center gap-6 mb-6 sm:mb-0">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl ${u.role === 'admin' ? 'bg-purple-600 text-white shadow-purple-500/20' : 'bg-primary-600 text-white shadow-primary-500/20'}`}>{u.name[0]}</div>
                          <div>
                              <div className="font-black text-gray-900 text-xl tracking-tight flex items-center gap-3">
                                  {u.name}
                                  {u.user_type === 'student' && <GraduationCap size={20} className="text-emerald-500" />}
                              </div>
                              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{u.email} • {u.role}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-5 w-full sm:w-auto">
                          <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${u.is_verified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{u.is_verified ? 'Active' : 'Suspended'}</div>
                          {u.role !== 'admin' && (
                              <button 
                                onClick={() => handleToggleUser(u.id)} 
                                className="flex-1 sm:flex-none px-8 py-4 bg-white text-gray-900 rounded-2xl font-black text-xs shadow-sm border border-gray-100 hover:bg-gray-900 hover:text-white transition-all active:scale-95"
                              >
                                  {u.is_verified ? 'Suspend User' : 'Restore Access'}
                              </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "students" && (
              <motion.div key="std" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                     <GraduationCap size={200} />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-10 tracking-tight">Student Verification Requests</h3>
                  
                  <div className="grid grid-cols-1 gap-8">
                    {studentVerifications.length === 0 && (
                      <div className="text-center py-24 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                         <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-6" />
                         <p className="text-xl font-black text-gray-900 mb-2 tracking-tight">All caught up!</p>
                         <p className="text-gray-400 font-medium">No pending verification requests at this moment.</p>
                      </div>
                    )}
                    
                    {studentVerifications.map((u) => (
                      <div key={u.id} className="rounded-[3rem] border border-gray-100 bg-gray-50 p-10 flex flex-col lg:flex-row items-center justify-between gap-10 hover:bg-white hover:shadow-2xl transition-all group">
                        <div className="flex-1 flex flex-col md:flex-row items-center gap-10">
                           {/* ID PREVIEW */}
                           <div className="w-48 h-32 bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 relative group/id">
                              {u.student_id_file ? (
                                <>
                                  <img 
                                    src={`${API_BASE}/${u.student_id_file}`} 
                                    alt="Student ID" 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/id:scale-110" 
                                  />
                                  <a href={`${API_BASE}/${u.student_id_file}`} target="_blank" rel="noreferrer" className="absolute inset-0 bg-gray-900/60 opacity-0 group-hover/id:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-[10px] uppercase tracking-widest gap-2">
                                     Full View <ExternalLink size={14}/>
                                  </a>
                                </>
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                   <AlertCircle size={32} />
                                   <span className="text-[10px] font-black uppercase mt-2">No File</span>
                                </div>
                              )}
                           </div>
                           
                           <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-2xl font-black text-gray-900 tracking-tight">{u.name}</h4>
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${u.student_verification_status === 'pending' ? 'bg-amber-100 text-amber-700' : u.student_verification_status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                  {u.student_verification_status}
                                </span>
                              </div>
                              <p className="text-gray-500 font-medium mb-4">{u.email}</p>
                              <div className="flex items-center gap-6">
                                 <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Submitted 2 days ago</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-4 w-full lg:w-auto">
                           <button 
                             disabled={actionLoading || u.student_verification_status === 'approved'} 
                             onClick={() => handleStudentVerification(u.id, "approve")} 
                             className="flex-1 lg:flex-none rounded-2xl bg-emerald-600 px-8 py-4 text-xs font-black text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:grayscale"
                           >
                             Approve Identity
                           </button>
                           <button 
                             disabled={actionLoading || u.student_verification_status === 'rejected'} 
                             onClick={() => handleStudentVerification(u.id, "reject")} 
                             className="flex-1 lg:flex-none rounded-2xl bg-white text-red-500 border border-gray-100 px-8 py-4 text-xs font-black shadow-sm hover:bg-red-50 transition-all disabled:opacity-50 disabled:grayscale"
                           >
                             Reject
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}