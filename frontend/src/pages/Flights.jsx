import { useEffect, useState } from "react";
import { getFlights } from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, MapPin, Calendar, Filter, Search, ArrowRight } from "lucide-react";

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
    e.preventDefault();
    const query = new URLSearchParams(filters).toString();
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
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Origin</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 transition-all" 
                      placeholder="City..."
                      value={filters.origin}
                      onChange={e => setFilters({...filters, origin: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Destination</label>
                  <div className="relative">
                    <Plane className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 transition-all" 
                      placeholder="City..."
                      value={filters.destination}
                      onChange={e => setFilters({...filters, destination: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Departure Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="date"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 transition-all" 
                      value={filters.date}
                      onChange={e => setFilters({...filters, date: e.target.value})}
                    />
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
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-3xl font-display font-black text-gray-900 tracking-tight">Available Flights</h2>
                <p className="text-gray-500 font-medium">Found {flights.length} results matching your search.</p>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {loading ? (
                // Skeleton Loader
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
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Departure</p>
                          <h4 className="text-2xl font-black text-gray-900">{f.origin}</h4>
                          <p className="text-gray-500 font-medium">{new Date(f.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full mb-3 uppercase tracking-tighter">
                            Non-stop
                          </div>
                          <div className="flex items-center w-full gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                            <div className="flex-1 h-[2px] bg-gray-100 relative">
                              <Plane className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-600" size={20} />
                            </div>
                            <div className="w-2 h-2 border-2 border-primary-600 rounded-full"></div>
                          </div>
                          <p className="text-xs font-bold text-gray-400 mt-3">{f.flight_number}</p>
                        </div>

                        <div className="md:text-right">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Arrival</p>
                          <h4 className="text-2xl font-black text-gray-900">{f.destination}</h4>
                          <p className="text-gray-500 font-medium">{new Date(f.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center md:items-end gap-4 min-w-[180px]">
                        <div className="text-right">
                          <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">{f.available_seats} seats left</span>
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