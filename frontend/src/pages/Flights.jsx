import { useEffect, useState } from "react";
import { getFlights } from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, MapPin, Calendar, Filter, Search, ArrowRight, DollarSign, Clock, LayoutGrid, SortAsc } from "lucide-react";

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

  const fetchFlights = () => {
    setLoading(true);
    getFlights(filters)
      .then(res => setFlights(res.data))
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFlights();
  }, [location.search]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const query = new URLSearchParams(Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
    )).toString();
    navigate(`/flights?${query}`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* FILTERS SIDEBAR */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 sticky top-28">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
                  <Filter size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Filters</h3>
              </div>

              <form onSubmit={handleSearch} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Route</label>
                  <div className="space-y-3">
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 transition-all" 
                        placeholder="Origin"
                        value={filters.origin}
                        onChange={e => setFilters({...filters, origin: e.target.value})}
                        />
                    </div>
                    <div className="relative">
                        <Plane className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 transition-all" 
                        placeholder="Destination"
                        value={filters.destination}
                        onChange={e => setFilters({...filters, destination: e.target.value})}
                        />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price Range ($)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="number"
                      placeholder="Min"
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500"
                      value={filters.min_price}
                      onChange={e => setFilters({...filters, min_price: e.target.value})}
                    />
                    <input 
                      type="number"
                      placeholder="Max"
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500"
                      value={filters.max_price}
                      onChange={e => setFilters({...filters, max_price: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Seat Class</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 appearance-none"
                    value={filters.seat_class}
                    onChange={e => setFilters({...filters, seat_class: e.target.value})}
                  >
                    <option value="">All Classes</option>
                    <option value="Economy Class">Economy</option>
                    <option value="Business Class">Business</option>
                    <option value="First Class">First Class</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Time of Day</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['morning', 'afternoon', 'evening'].map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setFilters({...filters, departure_time_slot: filters.departure_time_slot === slot ? "" : slot})}
                        className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${filters.departure_time_slot === slot ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-200' : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'}`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-gray-200 flex items-center justify-center gap-2">
                  <Search size={18} /> Apply Filters
                </button>
              </form>
            </div>
          </div>

          {/* FLIGHT LIST */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
              <div>
                <h2 className="text-3xl font-display font-black text-gray-900 tracking-tight">Available Flights</h2>
                <p className="text-gray-500 font-medium">Found {flights.length} results matching your search.</p>
              </div>

              <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100">
                <SortAsc size={16} className="text-gray-400 ml-2" />
                <select 
                   className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer pr-8"
                   value={filters.sort_by}
                   onChange={e => {
                     const newFilters = {...filters, sort_by: e.target.value};
                     setFilters(newFilters);
                     // Trigger search on sort change
                     const query = new URLSearchParams(Object.fromEntries(
                        Object.entries(newFilters).filter(([_, v]) => v !== "")
                     )).toString();
                     navigate(`/flights?${query}`);
                   }}
                >
                  <option value="departure_time">Earliest</option>
                  <option value="cheapest">Cheapest First</option>
                  <option value="fastest">Shortest Duration</option>
                </select>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {loading ? (
                [1,2,3].map(i => (
                  <div key={i} className="h-48 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
                ))
              ) : flights.length > 0 ? (
                flights.map((f, idx) => (
                  <motion.div
                    key={f.flight_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all group"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 items-center gap-8 text-center md:text-left w-full">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Departure</p>
                          <h4 className="text-2xl font-black text-gray-900">{f.origin}</h4>
                          <p className="text-gray-500 font-medium">{new Date(f.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-full mb-3 uppercase tracking-tighter flex items-center gap-1">
                            <Clock size={10} /> {f.duration_label || "Non-stop"}
                          </div>
                          <div className="flex items-center w-full gap-2 px-4">
                            <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                            <div className="flex-1 h-[2px] bg-gray-100 relative">
                              <Plane className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-600" size={20} />
                            </div>
                            <div className="w-2 h-2 border-2 border-primary-600 rounded-full"></div>
                          </div>
                          <p className="text-[10px] font-black text-gray-400 mt-3">{f.flight_number}</p>
                        </div>

                        <div className="md:text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Arrival</p>
                          <h4 className="text-2xl font-black text-gray-900">{f.destination}</h4>
                          <p className="text-gray-500 font-medium">{new Date(f.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center md:items-end gap-4 min-w-[180px]">
                        <div className="text-right">
                          <p className="text-3xl font-black text-gray-900 mb-1">${parseFloat(f.base_price).toFixed(0)}</p>
                          <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">{f.available_seats} seats left</span>
                        </div>
                        <button 
                          onClick={() => navigate(`/booking/${f.flight_id}`)}
                          className="w-full bg-primary-600 text-white font-bold py-4 px-8 rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 group-hover:scale-105"
                        >
                          Select Seat <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white p-20 rounded-[2.5rem] border border-gray-100 text-center">
                  <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Flights Found</h3>
                  <p className="text-gray-500 max-w-xs mx-auto">Try adjusting your filters or searching for a different route.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}