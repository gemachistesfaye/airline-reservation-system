import { useEffect, useState } from "react";
import { adminGetStats, adminGetAnalytics, adminGetBookings, getFlights, adminAddFlight, adminUpdateFlight, adminDeleteFlight, adminGetUsers, adminToggleUserStatus } from "../services/api";
import { useToast } from "../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Plane, Users, Calendar, TrendingUp, Trash2, Edit3, Plus, X, Search, MapPin, Clock, ShieldCheck, ShieldAlert, CreditCard, Star, Crown, Armchair, GraduationCap, DollarSign, BarChart3 } from "lucide-react";

export default function Admin() {
  const { showToast } = useToast();
  const [stats, setStats] = useState({ flights: 0, bookings: 0, passengers: 0, revenue: 0 });
  const [analytics, setAnalytics] = useState({ occupancy: [], classUsage: {}, trends: [] });
  const [flights, setFlights] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
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
      const [statsRes, analyticsRes, bookRes, flyRes, usersRes] = await Promise.all([
        adminGetStats(), adminGetAnalytics(), adminGetBookings(), getFlights(), adminGetUsers()
      ]);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
      setAdminBookings(bookRes.data);
      setFlights(flyRes.data);
      setAdminUsers(usersRes.data);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      
      {/* SIDEBAR */}
      <aside className="w-80 bg-white border-r border-gray-100 flex flex-col p-8 pt-32 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-4">
           <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center shadow-lg"><Plane size={24} /></div>
           <h2 className="text-2xl font-black text-gray-900 tracking-tight">Admin <span className="text-primary-600">Gate</span></h2>
        </div>
        <nav className="space-y-2 flex-1">
          {[
            { id: "overview", icon: <LayoutDashboard size={20} />, label: "Overview" },
            { id: "flights", icon: <Plane size={20} />, label: "Flight Fleet" },
            { id: "bookings", icon: <Calendar size={20} />, label: "Passenger Manifest" },
            { id: "users", icon: <Users size={20} />, label: "User Accounts" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/30' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-12 pt-32">
        <div className="max-w-6xl mx-auto">
          
          <AnimatePresence mode="wait">
            
            {activeTab === "overview" && (
              <motion.div key="ov" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                   <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Plane size={24}/></div>
                      <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Flights</p><h3 className="text-2xl font-black text-gray-900">{stats.flights}</h3></div>
                   </div>
                   <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col gap-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Calendar size={24}/></div>
                      <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Bookings</p><h3 className="text-2xl font-black text-gray-900">{stats.bookings}</h3></div>
                   </div>
                   <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col gap-4">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><DollarSign size={24}/></div>
                      <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Revenue</p><h3 className="text-2xl font-black text-gray-900">${parseFloat(stats.revenue).toLocaleString()}</h3></div>
                   </div>
                   <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col gap-4">
                      <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center"><Users size={24}/></div>
                      <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registered Users</p><h3 className="text-2xl font-black text-gray-900">{stats.passengers}</h3></div>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
                   {/* OCCUPANCY CHARTS */}
                   <div className="space-y-8">
                      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
                        <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3"><TrendingUp className="text-primary-600" size={24} /> Flight Occupancy Rates</h3>
                        <div className="space-y-6">
                            {analytics.occupancy.map(f => (
                            <div key={f.flight_number}>
                                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase mb-2">
                                    <span>{f.flight_number} • {f.origin} to {f.destination}</span>
                                    <span>{f.occupancy_rate}%</span>
                                </div>
                                <div className="h-3 bg-gray-50 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${f.occupancy_rate}%` }}
                                        className="h-full bg-primary-600 rounded-full" 
                                    />
                                </div>
                            </div>
                            ))}
                        </div>
                      </div>

                      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
                        <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3"><BarChart3 className="text-primary-600" size={24} /> Seat Usage per Class</h3>
                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { label: 'Economy', count: analytics.classUsage.economy_booked, color: 'bg-emerald-500', icon: <Armchair size={16}/> },
                                { label: 'Business', count: analytics.classUsage.business_booked, color: 'bg-indigo-500', icon: <Star size={16}/> },
                                { label: 'First Class', count: analytics.classUsage.first_booked, color: 'bg-amber-500', icon: <Crown size={16}/> }
                            ].map(item => (
                                <div key={item.label} className="text-center p-6 bg-gray-50 rounded-3xl border border-gray-100/50">
                                    <div className={`w-10 h-10 ${item.color} text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-${item.color.split('-')[1]}-200`}>{item.icon}</div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                                    <h4 className="text-2xl font-black text-gray-900">{item.count || 0}</h4>
                                    <p className="text-[10px] font-bold text-gray-400">Seats Booked</p>
                                </div>
                            ))}
                        </div>
                      </div>
                   </div>

                   {/* RECENT ACTIVITY */}
                   <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
                     <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3"><Calendar className="text-primary-600" size={24} /> Recent Manifest Entries</h3>
                     <div className="space-y-4">
                       {adminBookings.slice(0, 8).map(b => (
                         <div key={b.booking_id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100/50 hover:bg-white hover:shadow-lg transition-all">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-primary-600 shadow-sm text-xs">{b.flight_number}</div>
                               <div>
                                   <div className="text-sm font-black text-gray-900">{b.user_name}</div>
                                   <div className="text-[10px] font-bold text-gray-400 uppercase">{b.seat_class.split(' ')[0]} • {b.seat_number}</div>
                               </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-black text-gray-900">${parseFloat(b.total_price).toFixed(0)}</div>
                                <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase ${b.status === 'Confirmed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{b.status}</span>
                            </div>
                         </div>
                       ))}
                     </div>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === "flights" && (
              <motion.div key="fl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                 <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
                    <div className="flex justify-between items-center mb-10">
                      <h3 className="text-2xl font-black text-gray-900">{editingFlight ? "Update Route Details" : "Establish New Flight Route"}</h3>
                      {editingFlight && <button onClick={resetForm} className="text-gray-400 hover:text-gray-900 transition-colors"><X/></button>}
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Flight Number</label><input className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 transition-all" value={flightNumber} onChange={e => setFlightNumber(e.target.value)} required placeholder="AS102" /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Origin City</label><input className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 transition-all" value={origin} onChange={e => setOrigin(e.target.value)} required placeholder="e.g. Addis Ababa" /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Destination City</label><input className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 transition-all" value={destination} onChange={e => setDestination(e.target.value)} required placeholder="e.g. Nairobi" /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Departure Schedule</label><input type="datetime-local" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 transition-all" value={departureTime} onChange={e => setDepartureTime(e.target.value)} required /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Arrival Schedule</label><input type="datetime-local" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 transition-all" value={arrivalTime} onChange={e => setArrivalTime(e.target.value)} required /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Base Price ($)</label><input type="number" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 transition-all" value={basePrice} onChange={e => setBasePrice(e.target.value)} required /></div>
                      
                      <div className="col-span-full grid grid-cols-3 gap-6 pt-6 border-t border-gray-100 mt-4">
                         <div className="space-y-2"><label className="text-[10px] font-black text-amber-600 uppercase flex items-center gap-2 tracking-widest"><Crown size={14}/> First Class Capacity</label><input type="number" className="w-full px-5 py-4 bg-amber-50/30 border-none rounded-2xl font-black text-gray-700 focus:ring-2 focus:ring-amber-500 transition-all" value={fstSeats} onChange={e => setFstSeats(e.target.value)} required /></div>
                         <div className="space-y-2"><label className="text-[10px] font-black text-indigo-600 uppercase flex items-center gap-2 tracking-widest"><Star size={14}/> Business Capacity</label><input type="number" className="w-full px-5 py-4 bg-indigo-50/30 border-none rounded-2xl font-black text-gray-700 focus:ring-2 focus:ring-indigo-500 transition-all" value={busSeats} onChange={e => setBusSeats(e.target.value)} required /></div>
                         <div className="space-y-2"><label className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-2 tracking-widest"><Armchair size={14}/> Economy Capacity</label><input type="number" className="w-full px-5 py-4 bg-emerald-50/30 border-none rounded-2xl font-black text-gray-700 focus:ring-2 focus:ring-emerald-500 transition-all" value={ecoSeats} onChange={e => setEcoSeats(e.target.value)} required /></div>
                      </div>

                      <div className="col-span-full pt-8">
                        <button type="submit" disabled={actionLoading} className="w-full bg-gray-900 text-white font-black py-5 rounded-[2rem] shadow-2xl hover:bg-black transition-all active:scale-[0.98]">
                          {actionLoading ? "Processing Operation..." : editingFlight ? "Commit Route Changes" : "Deploy New Flight Route"}
                        </button>
                      </div>
                    </form>
                 </div>

                 <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
                    <h3 className="text-2xl font-black text-gray-900 mb-8">System Flight Fleet</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {flights.map(f => (
                        <div key={f.flight_id} className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex items-center justify-between hover:bg-white hover:shadow-2xl hover:shadow-blue-900/5 transition-all group">
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-black text-primary-600 shadow-md border border-gray-50 group-hover:scale-110 transition-transform">{f.flight_number}</div>
                            <div>
                                <div className="font-black text-gray-900 text-lg">{f.origin} <ArrowRight className="inline mx-2 text-gray-300" size={16}/> {f.destination}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Calendar size={12}/> {new Date(f.departure_time).toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <div className="text-right mr-4">
                                 <p className="text-lg font-black text-gray-900">${parseFloat(f.base_price).toFixed(0)}</p>
                                 <p className="text-[10px] font-bold text-gray-400 uppercase">{f.available_seats} Seats Avail</p>
                             </div>
                             <button onClick={() => handleEditClick(f)} className="p-4 bg-white text-gray-600 rounded-2xl shadow-sm hover:bg-gray-900 hover:text-white transition-all"><Edit3 size={20}/></button>
                             <button onClick={() => handleDelete(f.flight_id)} className="p-4 bg-white text-red-500 rounded-2xl shadow-sm hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === "bookings" && (
              <motion.div key="bk" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
                  <h3 className="text-2xl font-black text-gray-900 mb-10">Passenger Intelligence Manifest</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Passenger Details</th>
                          <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Route / Service</th>
                          <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Seat</th>
                          <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing</th>
                          <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {adminBookings.map(b => (
                          <tr key={b.booking_id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-6">
                                <div className="font-black text-gray-900">{b.user_name}</div>
                                <div className="text-[10px] text-primary-600 font-black uppercase tracking-tighter">{b.ticket_number}</div>
                            </td>
                            <td className="py-6">
                                <div className="font-black text-gray-700">{b.flight_number}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{b.seat_class}</div>
                            </td>
                            <td className="py-6 text-center">
                                <span className="bg-gray-900 text-white font-black px-4 py-1.5 rounded-xl text-[10px] tracking-widest shadow-lg shadow-gray-200">{b.seat_number}</span>
                            </td>
                            <td className="py-6">
                                <div className="font-black text-gray-900">${parseFloat(b.total_price).toFixed(2)}</div>
                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${b.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{b.payment_status}</span>
                            </td>
                            <td className="py-6 text-right">
                                <span className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase ${b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{b.status}</span>
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
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
                  <h3 className="text-2xl font-black text-gray-900 mb-10">User Account Management</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {adminUsers.map(u => (
                      <div key={u.id} className="p-6 bg-gray-50 rounded-[2.5rem] flex items-center justify-between border border-gray-100 hover:bg-white hover:shadow-2xl hover:shadow-blue-900/5 transition-all group">
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-md ${u.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-primary-600 text-white'}`}>{u.name[0]}</div>
                          <div>
                              <div className="font-black text-gray-900 text-lg flex items-center gap-2">
                                  {u.name}
                                  {u.user_type === 'student' && <GraduationCap size={18} className="text-emerald-500" />}
                              </div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{u.email} • {u.role}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${u.is_verified ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{u.is_verified ? 'Active Account' : 'Account Suspended'}</div>
                          {u.role !== 'admin' && (
                              <button 
                                onClick={() => handleToggleUser(u.id)} 
                                className="px-6 py-3 bg-white text-gray-900 rounded-2xl font-black text-xs shadow-sm border border-gray-100 hover:bg-gray-900 hover:text-white transition-all active:scale-95"
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

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}