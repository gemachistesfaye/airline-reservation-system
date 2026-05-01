import { useEffect, useState } from "react";
import { getFlights } from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, MapPin, Calendar, Filter, Search, ArrowRight, Clock, LayoutGrid, SortAsc, Star, ShieldCheck, Info } from "lucide-react";

export default function Flights() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    origin: searchParams.get('origin') || "",
    destination: searchParams.get('destination') || "",
    date: searchParams.get('date') || "",
    min_price: searchParams.get('min_price') || "",
    max_price: searchParams.get('max_price') || "",
    seat_class: searchParams.get('seat_class') || "",
    departure_time_slot: searchParams.get('departure_time_slot') || "",
    sort_by: searchParams.get('sort_by') || "departure_time",
    status: "Scheduled"
  });

  const fetchFlightsData = async () => {
    setLoading(true);
    try {
      const res = await getFlights(filters);
      setFlights(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlightsData();
  }, [location.search]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const query = new URLSearchParams(Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
    )).toString();
    navigate(`/flights?${query}`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-5xl font-black text-gray-900 tracking-tight mb-4">Search Flights</h2>
            <p className="text-gray-500 font-medium max-w-lg">Find the best deals on premium flights across the globe.</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
             <SortAsc size={16} className="text-gray-400 ml-2" />
             <select 
                className="bg-transparent border-none text-xs font-black text-gray-700 focus:ring-0 cursor-pointer pr-8 uppercase tracking-widest"
                value={filters.sort_by}
                onChange={e => {
                  const newFilters = {...filters, sort_by: e.target.value};
                  setFilters(newFilters);
                  const query = new URLSearchParams(Object.fromEntries(
                     Object.entries(newFilters).filter(([_, v]) => v !== "")
                  )).toString();
                  navigate(`/flights?${query}`);
                }}
             >
               <option value="departure_time">Earliest</option>
               <option value="cheapest">Cheapest</option>
               <option value="fastest">Fastest</option>
             </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* FILTERS SIDEBAR */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100 sticky top-32">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <Filter size={20} />
                </div>
                <h3 className="text-xl font-black text-gray-900">Refine Search</h3>
              </div>

              <form onSubmit={handleSearch} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Route</label>
                  <div className="space-y-3">
                    <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                        <input 
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 focus:bg-white focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 outline-none transition-all placeholder:text-gray-300" 
                          placeholder="Origin"
                          value={filters.origin}
                          onChange={e => setFilters({...filters, origin: e.target.value})}
                        />
                    </div>
                    <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                        <input 
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 focus:bg-white focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 outline-none transition-all placeholder:text-gray-300" 
                          placeholder="Destination"
                          value={filters.destination}
                          onChange={e => setFilters({...filters, destination: e.target.value})}
                        />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price Limit</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="number"
                      placeholder="Min"
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 focus:bg-white focus:ring-4 focus:ring-primary-600/5 outline-none transition-all"
                      value={filters.min_price}
                      onChange={e => setFilters({...filters, min_price: e.target.value})}
                    />
                    <input 
                      type="number"
                      placeholder="Max"
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 focus:bg-white focus:ring-4 focus:ring-primary-600/5 outline-none transition-all"
                      value={filters.max_price}
                      onChange={e => setFilters({...filters, max_price: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Schedule</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['morning', 'afternoon', 'evening'].map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setFilters({...filters, departure_time_slot: filters.departure_time_slot === slot ? "" : slot})}
                        className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${filters.departure_time_slot === slot ? 'bg-gray-900 text-white border-gray-900 shadow-xl shadow-gray-200' : 'bg-gray-50 text-gray-400 border-transparent hover:border-gray-200'}`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="w-full bg-primary-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-primary-500/30 hover:bg-primary-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                  <Search size={20} /> Update Results
                </button>
              </form>
            </div>
          </aside>

          {/* FLIGHT LIST */}
          <main className="flex-1 space-y-8">
            <AnimatePresence mode="popLayout">
              {loading ? (
                [1,2,3].map(i => (
                  <div key={i} className="h-64 bg-white rounded-[3rem] border border-gray-100 animate-pulse shadow-sm" />
                ))
              ) : flights.length > 0 ? (
                flights.map((f, idx) => (
                  <motion.div
                    key={f.flight_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                       <Plane size={180} className="rotate-45" />
                    </div>

                    <div className="flex flex-col xl:flex-row justify-between items-center gap-10">
                      
                      {/* JOURNEY INFO */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 items-center gap-8 text-center md:text-left w-full relative z-10">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Departure</p>
                          <h4 className="text-3xl font-black text-gray-900 tracking-tighter">{f.origin}</h4>
                          <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 font-bold mt-1">
                             <Clock size={14} className="text-primary-600" />
                             <span>{new Date(f.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="text-[10px] font-black text-primary-600 bg-primary-50 px-4 py-1.5 rounded-full mb-4 uppercase tracking-tighter shadow-sm border border-primary-100/50">
                            Non-stop Flight
                          </div>
                          <div className="flex items-center w-full gap-3 px-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary-600 shadow-lg shadow-primary-500/50"></div>
                            <div className="flex-1 h-[2px] bg-gray-100 relative">
                               <motion.div 
                                 animate={{ x: [0, 40, 0] }}
                                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                 className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-600"
                               >
                                 <Plane size={24} className="rotate-[-45deg]" />
                               </motion.div>
                            </div>
                            <div className="w-2.5 h-2.5 border-2 border-primary-600 rounded-full"></div>
                          </div>
                          <p className="text-[10px] font-black text-gray-400 mt-4 uppercase tracking-widest">{f.flight_number}</p>
                        </div>

                        <div className="md:text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Arrival</p>
                          <h4 className="text-3xl font-black text-gray-900 tracking-tighter">{f.destination}</h4>
                          <div className="flex items-center justify-center md:justify-end gap-2 text-gray-500 font-bold mt-1">
                             <span>{new Date(f.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                             <Clock size={14} className="text-primary-600" />
                          </div>
                        </div>
                      </div>

                      {/* ACTIONS & PRICING */}
                      <div className="flex flex-col items-center xl:items-end gap-6 min-w-[240px] border-t xl:border-t-0 xl:border-l border-gray-100 pt-8 xl:pt-0 xl:pl-10 w-full xl:w-auto relative z-10">
                        <div className="text-center xl:text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Starts From</p>
                          <p className="text-4xl font-black text-gray-900 tracking-tighter">${parseFloat(f.base_price).toFixed(0)}</p>
                          
                          <div className="mt-4 flex flex-wrap justify-center xl:justify-end gap-2">
                            <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                              Economy: {f.economy_seats_avail}
                            </div>
                            <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                              Business: {f.business_seats_avail}
                            </div>
                            <div className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-100">
                              First: {f.first_class_seats_avail}
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => navigate(`/book/${f.flight_id}`)}
                          className="w-full bg-gray-900 text-white font-black py-5 px-10 rounded-2xl hover:bg-primary-600 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 group-hover:scale-[1.02] active:scale-95"
                        >
                          Select Cabin <ArrowRight size={20} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white p-24 rounded-[4rem] border border-dashed border-gray-200 text-center">
                  <div className="w-24 h-24 bg-gray-50 text-gray-200 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                    <Search size={48} />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">No Flights Found</h3>
                  <p className="text-gray-500 font-medium max-w-xs mx-auto leading-relaxed">We couldn't find any flights matching your criteria. Try adjusting your filters.</p>
                  <button onClick={() => setFilters({})} className="mt-8 text-primary-600 font-black uppercase tracking-widest text-xs hover:underline">Clear all filters</button>
                </div>
              )}
            </AnimatePresence>
          </main>

        </div>
      </div>
    </div>
  );
}
