import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile, getUserBookings, cancelBooking } from "../services/api";
import { useToast } from "../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, ShieldCheck, Ticket, Plane, Clock, CheckCircle2, 
  ArrowRight, XCircle, GraduationCap, FileText, Download, LogOut,
  MapPin, Calendar, CreditCard, ChevronRight, Settings, History
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", username: "" });
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
    loadBookings();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await getUserProfile();
      setProfile(res.data);
      setEditForm({ name: res.data.name, username: res.data.username });
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const res = await getUserBookings();
      setBookings(res.data);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await updateUserProfile(editForm);
      showToast(res.message);
      setIsEditing(false);
      loadProfile();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const res = await cancelBooking(id);
      showToast(res.message);
      loadBookings();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12 items-start">
           
           {/* LEFT SIDEBAR - USER CARD */}
           <aside className="space-y-8">
              <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-2xl shadow-blue-900/5 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5 text-primary-600"><User size={120} /></div>
                 
                 <div className="relative z-10 text-center mb-8">
                    <div className="w-24 h-24 bg-primary-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/30 font-black text-3xl">
                       {profile?.name?.charAt(0)}
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{profile?.name}</h2>
                    <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">{profile?.username || "No username"}</p>
                 </div>

                 <div className="space-y-4 mb-10">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                       <Mail size={18} className="text-gray-400" />
                       <span className="text-[11px] font-bold text-gray-600 truncate">{profile?.email}</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                       <ShieldCheck size={18} className="text-emerald-500" />
                       <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">Verified Account</span>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <button 
                      onClick={() => setActiveTab("profile")}
                      className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${activeTab === 'profile' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900'}`}
                    >
                       <div className="flex items-center gap-3"><Settings size={18}/> Settings</div>
                       <ChevronRight size={14} />
                    </button>
                    <button 
                      onClick={() => setActiveTab("bookings")}
                      className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${activeTab === 'bookings' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900'}`}
                    >
                       <div className="flex items-center gap-3"><History size={18}/> My Trips</div>
                       <ChevronRight size={14} />
                    </button>
                 </div>
                 
                 <button 
                   onClick={() => { localStorage.clear(); navigate('/login'); }}
                   className="w-full flex items-center justify-center gap-3 p-5 mt-8 border-2 border-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all"
                 >
                    <LogOut size={18}/> Sign Out
                 </button>
              </div>

              {/* DOCUMENT STATUS */}
              <div className="bg-gray-900 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-[-20%] right-[-10%] opacity-10 group-hover:scale-110 transition-transform duration-700"><ShieldCheck size={200}/></div>
                 <h3 className="text-xl font-black mb-6 tracking-tight flex items-center gap-3">
                   <FileText className="text-primary-400" /> Documentation
                 </h3>
                 <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center py-4 border-b border-white/10">
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Passport Status</p>
                       <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/30">Stored</span>
                    </div>
                    {profile.is_student === 1 && (
                      <div className="flex justify-between items-center py-4 border-b border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Student ID</p>
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                          profile.student_verification_status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          profile.student_verification_status === 'pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                          'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {profile.student_verification_status}
                        </span>
                      </div>
                    )}
                 </div>
                 <p className="text-[9px] text-gray-500 mt-8 font-bold uppercase tracking-tighter">* All documents are encrypted and stored on secure AeroSpace servers.</p>
              </div>
           </aside>

           {/* RIGHT CONTENT */}
           <main>
              <AnimatePresence mode="wait">
                 {activeTab === 'profile' && (
                    <motion.div 
                      key="profile-tab" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="bg-white rounded-[3.5rem] p-12 border border-gray-100 shadow-2xl shadow-blue-900/5"
                    >
                       <div className="flex justify-between items-center mb-12">
                          <h3 className="text-3xl font-black text-gray-900 tracking-tight">Account Settings</h3>
                          <button 
                            onClick={() => setIsEditing(!isEditing)}
                            className="bg-gray-50 text-gray-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
                          >
                             {isEditing ? "Cancel Edit" : "Modify Profile"}
                          </button>
                       </div>

                       <form onSubmit={handleUpdateProfile} className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Display Name</label>
                                <input 
                                  disabled={!isEditing}
                                  value={editForm.name}
                                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold text-gray-900 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 transition-all disabled:opacity-60"
                                />
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Public Username</label>
                                <input 
                                  disabled={!isEditing}
                                  value={editForm.username}
                                  onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold text-gray-900 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 transition-all disabled:opacity-60"
                                />
                             </div>
                          </div>
                          
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Login Email (Permanent)</label>
                             <input 
                               readOnly
                               value={profile.email}
                               className="w-full px-6 py-4 bg-gray-50/50 rounded-2xl font-bold text-gray-400 border border-gray-100 cursor-not-allowed"
                             />
                          </div>

                          {isEditing && (
                            <motion.button 
                              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                              type="submit"
                              className="w-full bg-gray-900 text-white font-black py-5 rounded-[2rem] hover:bg-primary-600 shadow-xl transition-all flex items-center justify-center gap-3"
                            >
                               Save Global Changes <CheckCircle2 size={20}/>
                            </motion.button>
                          )}
                       </form>

                       <div className="mt-16 pt-16 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="p-8 bg-gray-50 rounded-[2.5rem] relative overflow-hidden group border border-gray-100">
                             <div className="absolute top-0 right-0 p-6 opacity-5"><GraduationCap size={60}/></div>
                             <h4 className="font-black text-gray-900 mb-2">Student Benefits</h4>
                             <p className="text-gray-500 text-xs font-medium leading-relaxed mb-6">Verified students receive exclusive 20% discounts on all global routes.</p>
                             {profile.is_student === 1 ? (
                                <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                                   <CheckCircle2 size={14}/> Student Program Active
                                </div>
                             ) : (
                                <button onClick={() => showToast("Please contact support to upgrade to student status", "info")} className="text-primary-600 font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-2">
                                   Apply for Discount <ArrowRight size={14}/>
                                </button>
                             )}
                          </div>
                          <div className="p-8 bg-gray-50 rounded-[2.5rem] relative overflow-hidden group border border-gray-100">
                             <div className="absolute top-0 right-0 p-6 opacity-5"><ShieldCheck size={60}/></div>
                             <h4 className="font-black text-gray-900 mb-2">Security Shield</h4>
                             <p className="text-gray-500 text-xs font-medium leading-relaxed mb-6">Manage your security settings, sessions, and multi-factor authentication.</p>
                             <button onClick={() => navigate('/change-password')} className="text-primary-600 font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-2">
                                Change Password <ArrowRight size={14}/>
                             </button>
                          </div>
                       </div>
                    </motion.div>
                 )}

                 {activeTab === 'bookings' && (
                    <motion.div 
                      key="bookings-tab" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                       <div className="flex justify-between items-center px-6">
                          <h3 className="text-3xl font-black text-gray-900 tracking-tight">Booking History</h3>
                          <span className="bg-white border border-gray-200 px-4 py-2 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">{bookings.length} Total Trips</span>
                       </div>

                       {bookings.length === 0 ? (
                          <div className="bg-white p-20 rounded-[3.5rem] text-center border border-gray-100">
                             <Plane size={64} className="mx-auto text-gray-100 mb-6" />
                             <h3 className="text-2xl font-black text-gray-900 mb-2">The sky awaits you.</h3>
                             <p className="text-gray-500 font-medium mb-10">You haven't made any reservations yet. Start your journey today.</p>
                             <button onClick={() => navigate('/flights')} className="bg-gray-900 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-600 transition-all flex items-center justify-center gap-3 mx-auto">
                                Search Flights <ArrowRight size={18}/>
                             </button>
                          </div>
                       ) : (
                          bookings.map(b => (
                             <div key={b.booking_id} className="bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-900/5 relative overflow-hidden group">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                   <div className="flex items-center gap-6">
                                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 shadow-inner group-hover:bg-primary-600 group-hover:text-white transition-all">
                                         <Plane size={28} />
                                      </div>
                                      <div>
                                         <div className="flex items-center gap-3 mb-1">
                                            <h4 className="text-2xl font-black text-gray-900 tracking-tighter">{b.origin}</h4>
                                            <ArrowRight size={18} className="text-gray-300" />
                                            <h4 className="text-2xl font-black text-gray-900 tracking-tighter">{b.destination}</h4>
                                         </div>
                                         <div className="flex gap-4">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                               <Calendar size={12}/> {new Date(b.departure_time).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-primary-600 uppercase tracking-widest">
                                               <Ticket size={12}/> {b.ticket_number}
                                            </div>
                                         </div>
                                      </div>
                                   </div>

                                   <div className="flex flex-wrap items-center gap-4">
                                      <div className="text-right mr-4">
                                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount Paid</p>
                                         <p className="text-xl font-black text-gray-900">${b.total_price}</p>
                                      </div>
                                      <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                        b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                        b.status === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                                        'bg-amber-50 text-amber-600 border-amber-100'
                                      }`}>
                                        {b.status}
                                      </span>
                                      {b.status !== 'Cancelled' && (
                                         <button 
                                           onClick={() => handleCancel(b.booking_id)}
                                           className="w-11 h-11 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                                         >
                                            <XCircle size={18} />
                                         </button>
                                      )}
                                   </div>
                                </div>
                             </div>
                          ))
                       )}
                    </motion.div>
                 )}
              </AnimatePresence>
           </main>

        </div>
      </div>
    </div>
  );
}
