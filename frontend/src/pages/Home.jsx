import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, PlaneTakeoff, ShieldCheck, Clock, Award, ArrowRight } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState({ origin: "", destination: "", date: "" });

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams(search).toString();
    navigate(`/flights?${query}`);
  };

  return (
    <div className="min-h-screen bg-white">
      
      {/* HERO SECTION */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background Circles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -top-24 -left-24 w-[600px] h-[600px] bg-primary-100 rounded-full blur-3xl" 
          />
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 15, repeat: Infinity, delay: 2 }}
            className="absolute -bottom-24 -right-24 w-[800px] h-[800px] bg-blue-100 rounded-full blur-3xl" 
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-display font-black text-gray-900 tracking-tighter mb-6 leading-tight">
              Elevate Your <span className="text-gradient">Journey.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto mb-12 font-medium">
              Experience world-class travel with AeroSpace. Premium service, seamless booking, and destinations beyond your imagination.
            </p>
          </motion.div>

          {/* SEARCH BAR */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-5xl mx-auto"
          >
            <form onSubmit={handleSearch} className="bg-white p-4 rounded-[2rem] shadow-2xl shadow-blue-900/10 border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
              
              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="From where?" 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 transition-all"
                    value={search.origin}
                    onChange={e => setSearch({...search, origin: e.target.value})}
                  />
                </div>
                <div className="relative group">
                  <PlaneTakeoff className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="To where?" 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 transition-all"
                    value={search.destination}
                    onChange={e => setSearch({...search, destination: e.target.value})}
                  />
                </div>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input 
                    type="date" 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 transition-all"
                    value={search.date}
                    onChange={e => setSearch({...search, date: e.target.value})}
                  />
                </div>
              </div>

              <button type="submit" className="w-full md:w-auto bg-primary-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-all hover:shadow-xl hover:shadow-primary-500/30 active:scale-95">
                <Search size={20} />
                Search Flights
              </button>

            </form>
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">Why Fly AeroSpace?</h2>
            <p className="text-gray-500 font-medium">The standard of excellence in the sky.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <ShieldCheck size={32} />, title: "Safety First", desc: "Our fleet is maintained to the highest international standards of safety and care." },
              { icon: <Clock size={32} />, title: "Always On Time", desc: "We value your time. 99% of our flights depart and arrive exactly as scheduled." },
              { icon: <Award size={32} />, title: "Award Winning", desc: "Voted #1 for cabin service and passenger comfort 5 years in a row." },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5"
              >
                <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR DESTINATIONS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">Explore Destinations</h2>
              <p className="text-gray-500 font-medium">Handpicked routes for your next adventure.</p>
            </div>
            <button onClick={() => navigate('/flights')} className="text-primary-600 font-bold flex items-center gap-2 hover:gap-4 transition-all">
              View All Flights <ArrowRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { city: "New York", country: "USA", img: "🗽" },
              { city: "Paris", country: "France", img: "🗼" },
              { city: "Dubai", country: "UAE", img: "🏙️" },
              { city: "Tokyo", country: "Japan", img: "⛩️" },
            ].map((dest, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.05 }}
                className="relative group h-80 rounded-[2.5rem] overflow-hidden cursor-pointer"
                onClick={() => {
                   setSearch({...search, destination: dest.city});
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                <div className="absolute inset-0 bg-primary-100 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-700">
                  {dest.img}
                </div>
                <div className="absolute bottom-8 left-8 z-20">
                  <h4 className="text-2xl font-black text-white">{dest.city}</h4>
                  <p className="text-gray-300 font-bold text-sm uppercase tracking-widest">{dest.country}</p>
                </div>
                <div className="absolute top-6 right-6 z-20 bg-primary-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                  High Demand
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
