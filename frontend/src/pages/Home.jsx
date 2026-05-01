import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, PlaneTakeoff, ShieldCheck, Clock, Award, ArrowRight, Star, Globe, TrendingUp, Users } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState({ origin: "", destination: "", date: "" });

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams(search).toString();
    navigate(`/flights?${query}`);
  };

  return (
    <div className="min-h-screen bg-white selection:bg-primary-600 selection:text-white">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1], 
              rotate: [0, 10, 0],
              opacity: [0.05, 0.1, 0.05] 
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[10%] -left-[5%] w-[800px] h-[800px] bg-primary-200 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1], 
              rotate: [0, -15, 0],
              opacity: [0.05, 0.08, 0.05] 
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[5%] -right-[10%] w-[1000px] h-[1000px] bg-blue-200 rounded-full blur-[150px]" 
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-3 bg-gray-900/5 backdrop-blur-md px-6 py-2.5 rounded-full mb-8 border border-gray-900/5"
            >
              <Star className="text-amber-500" size={16} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">The Gold Standard of Travel</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-7xl md:text-[9.5rem] font-black text-gray-900 tracking-tighter mb-8 leading-[0.85]"
            >
              SKY <span className="text-primary-600">LIMITLESS.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto mb-16 font-medium leading-relaxed"
            >
              Redefining the horizon with bespoke flight experiences. Where every destination is a masterpiece and every journey is an evolution.
            </motion.p>
          </div>

          {/* PREMIUM SEARCH INTERFACE */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-6xl mx-auto"
          >
            <div className="bg-white/70 backdrop-blur-2xl p-4 rounded-[3.5rem] shadow-[0_32px_80px_rgba(0,0,0,0.06)] border border-white/50 relative">
               {/* Decorative Tabs */}
               <div className="flex gap-6 px-10 mb-6 mt-2">
                  <div className="flex items-center gap-2 text-primary-600 font-black text-xs uppercase tracking-widest cursor-pointer border-b-2 border-primary-600 pb-2">
                     <PlaneTakeoff size={14} /> One Way
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 font-black text-xs uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors pb-2">
                     <Globe size={14} /> Multi-City
                  </div>
               </div>

              <form onSubmit={handleSearch} className="flex flex-col xl:flex-row gap-3 items-center">
                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative group">
                    <MapPin className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                    <input 
                      type="text" 
                      placeholder="Origin Location" 
                      className="w-full pl-16 pr-8 py-6 bg-gray-50/50 border border-gray-100 rounded-[2.5rem] font-black text-gray-900 focus:bg-white focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 outline-none transition-all placeholder:text-gray-300"
                      value={search.origin}
                      onChange={e => setSearch({...search, origin: e.target.value})}
                    />
                  </div>
                  <div className="relative group">
                    <MapPin className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                    <input 
                      type="text" 
                      placeholder="Desired Destination" 
                      className="w-full pl-16 pr-8 py-6 bg-gray-50/50 border border-gray-100 rounded-[2.5rem] font-black text-gray-900 focus:bg-white focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 outline-none transition-all placeholder:text-gray-300"
                      value={search.destination}
                      onChange={e => setSearch({...search, destination: e.target.value})}
                    />
                  </div>
                  <div className="relative group">
                    <Calendar className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                    <input 
                      type="date" 
                      className="w-full pl-16 pr-8 py-6 bg-gray-50/50 border border-gray-100 rounded-[2.5rem] font-black text-gray-900 focus:bg-white focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 outline-none transition-all"
                      value={search.date}
                      onChange={e => setSearch({...search, date: e.target.value})}
                    />
                  </div>
                </div>

                <button type="submit" className="w-full xl:w-auto bg-gray-900 text-white px-14 py-6 rounded-[2.5rem] font-black flex items-center justify-center gap-3 hover:bg-primary-600 transition-all hover:shadow-[0_20px_40px_rgba(37,99,235,0.25)] active:scale-95 group">
                  <Search size={20} className="group-hover:scale-125 transition-transform" />
                  Explore Flights
                </button>
              </form>
            </div>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-12 mt-12">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><TrendingUp size={20}/></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">99.8% On-Time</p>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><Globe size={20}/></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">120+ Countries</p>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600"><Users size={20}/></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">2M+ Loyal Flyers</p>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CURATED DESTINATIONS */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="text-primary-600 font-black text-xs uppercase tracking-[0.3em] mb-4"
              >
                World Collection
              </motion.div>
              <h2 className="text-5xl font-black text-gray-900 tracking-tight leading-[1.1]">Curated <br /> <span className="text-gray-400">Destinations</span></h2>
            </div>
            <motion.button 
              whileHover={{ x: 10 }}
              onClick={() => navigate('/flights')} 
              className="group text-gray-900 font-black flex items-center gap-3 text-sm uppercase tracking-widest"
            >
              The Full Fleet <ArrowRight size={20} className="text-primary-600 group-hover:translate-x-2 transition-transform" />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { city: "New York", country: "United States", img: "nyc_destination_1777630666499.png", tag: "Most Popular" },
              { city: "Paris", country: "France", img: "paris_destination_1777630933288.png", tag: "Romantic Getaway" },
              { city: "Dubai", country: "UAE", img: "dubai_destination_1777631247465.png", tag: "Modern Luxury" },
              { city: "Tokyo", country: "Japan", img: "tokyo_destination_1777631535565.png", tag: "Culture & Tech" },
            ].map((dest, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -12 }}
                className="relative group h-[500px] rounded-[3.5rem] overflow-hidden cursor-pointer shadow-2xl shadow-blue-900/5 border border-gray-100"
                onClick={() => {
                   setSearch({...search, destination: dest.city});
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-gray-950 via-gray-900/10 to-transparent group-hover:via-gray-900/40 transition-all duration-700" />
                <img 
                  src={`/${dest.img}`} 
                  alt={dest.city} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" 
                />
                
                <div className="absolute top-8 left-8 z-20">
                   <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-[10px] font-black uppercase tracking-widest text-white">
                      {dest.tag}
                   </div>
                </div>

                <div className="absolute bottom-10 left-10 z-20">
                  <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-2">{dest.country}</p>
                  <h4 className="text-3xl font-black text-white tracking-tighter mb-4">{dest.city}</h4>
                  <div className="flex items-center gap-2 text-white/60 font-bold text-xs group-hover:text-white transition-colors">
                     Discover <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE STANDARDS */}
      <section className="py-40 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
             <div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="relative"
                >
                   <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary-100 rounded-full blur-[80px] -z-10" />
                   <h2 className="text-6xl font-black text-gray-900 tracking-tight leading-[0.9] mb-8">Service Beyond <br /> <span className="text-primary-600">The Horizon.</span></h2>
                   <p className="text-xl text-gray-500 font-medium leading-relaxed mb-12">
                      We believe that travel is not just about reaching a destination, but the elevation of the human spirit through impeccable service and unparalleled comfort.
                   </p>
                   <div className="grid grid-cols-2 gap-8">
                      <div>
                         <h4 className="text-3xl font-black text-gray-900 mb-1">5★</h4>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Rating</p>
                      </div>
                      <div>
                         <h4 className="text-3xl font-black text-gray-900 mb-1">Zero</h4>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Carbon Goals</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-6">
               {[
                 { icon: <ShieldCheck size={28} />, title: "Safety Protocol 2.0", desc: "Our fleet utilizes advanced biometric systems and rigorous engineering audits for total peace of mind." },
                 { icon: <Clock size={28} />, title: "Precision Scheduling", desc: "Proprietary AI routing ensures we maintain a 99.8% on-time departure rate globally." },
                 { icon: <Award size={28} />, title: "Culinary Excellence", desc: "Michelin-starred chefs design our in-flight menus, bringing global fine dining to 35,000 feet." },
               ].map((feature, i) => (
                 <motion.div 
                   key={i}
                   whileHover={{ x: 12 }}
                   className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-900/5 flex items-start gap-8"
                 >
                   <div className="w-16 h-16 bg-gray-50 text-gray-900 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-sm">
                     {feature.icon}
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-gray-900 mb-3 tracking-tight">{feature.title}</h3>
                     <p className="text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
                   </div>
                 </motion.div>
               ))}
             </div>
          </div>
        </div>
      </section>

    </div>
  );
}

