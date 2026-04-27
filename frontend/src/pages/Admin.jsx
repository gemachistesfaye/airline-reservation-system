import { useEffect, useState } from "react";
import { adminGetStats, adminGetAnalytics, adminGetBookings, getFlights, adminAddFlight, adminUpdateFlight, adminDeleteFlight, adminGetUsers, adminToggleUserStatus } from "../services/api";
import { useToast } from "../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Plane, Users, Calendar, TrendingUp, Trash2, Edit3, Plus, X, Search, MapPin, Clock, ShieldCheck, ShieldAlert } from "lucide-react";

export default function Admin() {
  const { showToast } = useToast();
  const [stats, setStats] = useState({ flights: 0, bookings: 0, passengers: 0 });
  const [analytics, setAnalytics] = useState({ occupancy: [], trends: [] });
  const [flights, setFlights] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Form State
  const [flightNumber, setFlightNumber] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [status, setStatus] = useState("Scheduled");
  const [totalSeats, setTotalSeats] = useState(60);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, analyticsData, bookData, flyData, usersData] = await Promise.all([
        adminGetStats(),
        adminGetAnalytics(),
        adminGetBookings(),
        getFlights(),
        adminGetUsers()
      ]);
      setStats(statsData.data);
      setAnalytics(analyticsData.data);
      setAdminBookings(bookData.data);
      setFlights(flyData.data);
      setAdminUsers(usersData.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setEditingFlight(null);
    setFlightNumber("");
    setOrigin("");
    setDestination("");
    setDepartureTime("");
    setArrivalTime("");
    setStatus("Scheduled");
    setTotalSeats(60);
  };

  const handleEditClick = (f) => {
    setEditingFlight(f);
    setFlightNumber(f.flight_number);
    setOrigin(f.origin);
    setDestination(f.destination);
    setDepartureTime(f.departure_time ? f.departure_time.replace(' ', 'T') : "");
    setArrivalTime(f.arrival_time ? f.arrival_time.replace(' ', 'T') : "");
    setStatus(f.status);
    setTotalSeats(f.total_seats);
    setActiveTab("flights"); // Jump to flights tab if editing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = { flight_number: flightNumber, origin, destination, departure_time: departureTime, arrival_time: arrivalTime, status, total_seats: totalSeats };
      let res = editingFlight && editingFlight.flight_id
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

  const handleDelete = async (id) => {
    if (!window.confirm("Confirm flight deletion? All related bookings will be removed.")) return;
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
           <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Plane size={24} />
           </div>
           <h2 className="text-2xl font-black text-gray-900 tracking-tight">Admin <span className="text-primary-600">Pro</span></h2>
        </div>
        <nav className="space-y-2 flex-1">
          {[
            { id: "overview", icon: <LayoutDashboard size={20} />, label: "Overview" },
            { id: "flights", icon: <Plane size={20} />, label: "Manage Flights" },
            { id: "bookings", icon: <Calendar size={20} />, label: "Passenger Manifest" },
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
            
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <motion.div key="ov" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Plane size={24}/></div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Flights</p>
                        <h3 className="text-3xl font-black text-gray-900">{stats.flights}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Calendar size={24}/></div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Global Bookings</p>
                        <h3 className="text-3xl font-black text-gray-900">{stats.bookings}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Users size={24}/></div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Users</p>
                        <h3 className="text-3xl font-black text-gray-900">{stats.passengers}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                   <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100">
                     <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                       <Calendar className="text-primary-600" size={24} /> Recent Bookings
                     </h3>
                     <div className="space-y-4">
                       {adminBookings.slice(0, 5).map(b => (
                         <div key={b.booking_id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-primary-600 shadow-sm text-xs">{b.flight_number}</div>
                               <div>
                                  <div className="text-sm font-black text-gray-900">{b.first_name} {b.last_name}</div>
                                  <div className="text-[10px] font-bold text-gray-400 uppercase">{new Date(b.booking_date).toLocaleDateString()} • {b.ticket_number}</div>
                               </div>
                            </div>
                            <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-lg uppercase">Confirmed</span>
                         </div>
                       ))}
                       {adminBookings.length === 0 && <p className="text-center text-gray-400 py-10">No recent bookings</p>}
                     </div>
                   </div>

                   <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100">
                     <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                       <Users className="text-primary-600" size={24} /> Newest Members
                     </h3>
                     <div className="space-y-4">
                       {adminUsers.slice(0, 5).map(u => (
                         <div key={u.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center font-black text-xs">
                                  {u.first_name[0]}{u.last_name[0]}
                               </div>
                               <div>
                                  <div className="text-sm font-black text-gray-900">{u.first_name} {u.last_name}</div>
                                  <div className="text-[10px] font-bold text-gray-400 uppercase">Joined {new Date(u.created_at).toLocaleDateString()}</div>
                               </div>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${u.is_verified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                         </div>
                       ))}
                       {adminUsers.length === 0 && <p className="text-center text-gray-400 py-10">No new members</p>}
                     </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                      <TrendingUp className="text-primary-600" size={24} /> Occupancy Rates
                    </h3>
                    <div className="space-y-6">
                      {analytics.occupancy.map(f => (
                        <div key={f.flight_number}>
                          <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                            <span>{f.flight_number} ({f.total_seats - f.available_seats}/{f.total_seats})</span>
                            <span>{f.occupancy_rate}%</span>
                          </div>
                          <div className="h-3 bg-gray-50 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: `${f.occupancy_rate}%` }} 
                              className="h-full bg-primary-600 rounded-full shadow-lg shadow-primary-500/20" 
                            />
                          </div>
                        </div>
                      ))}
                      {analytics.occupancy.length === 0 && <p className="text-center text-gray-400 py-10">No data available</p>}
                    </div>
                  </div>
                  
                  <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                      <TrendingUp className="text-primary-600" size={24} /> Recent Trends
                    </h3>
                    <div className="space-y-4">
                      {analytics.trends.map(t => (
                        <div key={t.date} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                          <span className="font-bold text-gray-600">{new Date(t.date).toLocaleDateString()}</span>
                          <span className="bg-white px-4 py-1 rounded-xl shadow-sm font-black text-primary-600">{t.count} bookings</span>
                        </div>
                      ))}
                      {analytics.trends.length === 0 && <p className="text-center text-gray-400 py-10">No recent activity</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* FLIGHT MANAGEMENT TAB */}
            {activeTab === "flights" && (
              <motion.div key="fl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                 <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100">
                    <div className="flex justify-between items-center mb-10">
                      <h3 className="text-2xl font-black text-gray-900">{editingFlight ? "Edit Flight" : "Add New Flight"}</h3>
                      {editingFlight && <button onClick={resetForm} className="text-gray-400 hover:text-gray-900 transition-colors"><X/></button>}
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Flight Number</label>
                        <input className="input-premium bg-gray-50" value={flightNumber} onChange={e => setFlightNumber(e.target.value)} required placeholder="e.g. AS102" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Origin</label>
                        <input className="input-premium bg-gray-50" value={origin} onChange={e => setOrigin(e.target.value)} required placeholder="City name" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Destination</label>
                        <input className="input-premium bg-gray-50" value={destination} onChange={e => setDestination(e.target.value)} required placeholder="City name" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Departure</label>
                        <input type="datetime-local" className="input-premium bg-gray-50" value={departureTime} onChange={e => setDepartureTime(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Arrival</label>
                        <input type="datetime-local" className="input-premium bg-gray-50" value={arrivalTime} onChange={e => setArrivalTime(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Total Seats</label>
                        <input type="number" className="input-premium bg-gray-50" value={totalSeats} onChange={e => setTotalSeats(e.target.value)} required disabled={!!editingFlight} />
                      </div>
                      <div className="col-span-full pt-4">
                        <button type="submit" disabled={actionLoading} className="w-full bg-primary-600 text-white font-bold py-4 rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20 disabled:opacity-50">
                          {actionLoading ? "Syncing..." : editingFlight ? "Update Flight Details" : "Establish Flight Route"}
                        </button>
                      </div>
                    </form>
                 </div>

                 <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100">
                    <h3 className="text-2xl font-black text-gray-900 mb-8">Current Fleet</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {flights.map(f => (
                        <div key={f.flight_id} className="group p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between hover:bg-white hover:shadow-xl transition-all">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-primary-600 shadow-sm">{f.flight_number}</div>
                            <div>
                               <div className="font-black text-gray-900">{f.origin} → {f.destination}</div>
                               <div className="text-xs font-bold text-gray-400">{new Date(f.departure_time).toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                             <button onClick={() => handleEditClick(f)} className="p-3 bg-white text-gray-600 rounded-xl shadow-sm hover:bg-gray-900 hover:text-white transition-all"><Edit3 size={18}/></button>
                             <button onClick={() => handleDelete(f.flight_id)} className="p-3 bg-white text-red-500 rounded-xl shadow-sm hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
              </motion.div>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === "bookings" && (
              <motion.div key="bk" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black text-gray-900">Passenger Manifest</h3>
                    <div className="text-xs font-bold text-gray-400 bg-gray-50 px-4 py-2 rounded-xl">Total: {adminBookings.length}</div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-50">
                          <th className="pb-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Passenger</th>
                          <th className="pb-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Flight</th>
                          <th className="pb-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Seat</th>
                          <th className="pb-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {adminBookings.map(b => (
                          <tr key={b.booking_id} className="group hover:bg-gray-50/50 transition-colors">
                            <td className="py-6">
                              <div className="font-bold text-gray-900">{b.first_name} {b.last_name}</div>
                              <div className="text-xs text-primary-600 font-bold">{b.ticket_number}</div>
                            </td>
                            <td className="py-6">
                              <div className="font-black text-gray-700">{b.flight_number}</div>
                              <div className="text-xs text-gray-400 font-medium">{b.origin} → {b.destination}</div>
                            </td>
                            <td className="py-6"><span className="bg-gray-900 text-white font-black px-3 py-1 rounded-lg text-xs">{b.seat_number}</span></td>
                            <td className="py-6 text-right">
                              <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${b.status === 'Confirmed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* USERS TAB */}
            {activeTab === "users" && (
              <motion.div key="usr" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100">
                  <h3 className="text-2xl font-black text-gray-900 mb-8">User Control Panel</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {adminUsers.map(u => (
                      <div key={u.id} className="p-6 bg-gray-50 rounded-3xl flex items-center justify-between border border-gray-100 group hover:bg-white hover:shadow-lg transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${u.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                            {u.first_name[0]}{u.last_name[0]}
                          </div>
                          <div>
                            <div className="font-black text-gray-900">{u.first_name} {u.last_name} <span className="text-xs font-bold text-gray-400 ml-2">@{u.username}</span></div>
                            <div className="text-xs font-medium text-gray-400">{u.email} • Role: <span className="uppercase">{u.role}</span></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold ${u.is_verified ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {u.is_verified ? <ShieldCheck size={14}/> : <ShieldAlert size={14}/>}
                            {u.is_verified ? 'Verified' : 'Suspended/Unverified'}
                          </div>
                          {u.role !== 'admin' && (
                            <button 
                              onClick={() => handleToggleUser(u.id)}
                              className="px-6 py-2.5 bg-white text-gray-900 rounded-xl font-bold shadow-sm border border-gray-100 hover:bg-gray-900 hover:text-white transition-all"
                            >
                              {u.is_verified ? 'Suspend' : 'Verify'}
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