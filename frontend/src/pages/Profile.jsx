import { useState, useEffect } from "react";
import { getUserProfile, updateUserProfile } from "../services/api";
import { useToast } from "../components/Toast";
import { motion } from "framer-motion";
import { User, Mail, Phone, Shield, Save, Camera, Award, CreditCard, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ 
    first_name: "", 
    last_name: "", 
    username: "", 
    email: "", 
    phone_number: "", 
    passport_number: "", 
    date_of_birth: "" 
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getUserProfile()
      .then(res => {
        setProfile(res.data);
      })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateUserProfile(profile);
      showToast(res.message);
      // Update local storage user data too
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...user, ...profile }));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12">
          
          {/* SIDEBAR CARD */}
          <aside className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-[3rem] shadow-xl shadow-blue-900/5 border border-gray-100 text-center"
            >
              <div className="relative w-32 h-32 mx-auto mb-6 group">
                <div className="w-full h-full bg-primary-100 text-primary-600 rounded-[2.5rem] flex items-center justify-center text-4xl font-black">
                  {profile.first_name?.[0]}{profile.last_name?.[0]}
                </div>
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center shadow-lg border-4 border-white group-hover:scale-110 transition-transform">
                  <Camera size={18} />
                </button>
              </div>
              <h3 className="text-2xl font-black text-gray-900">{profile.first_name} {profile.last_name}</h3>
              <p className="text-primary-600 font-black text-sm mb-1">@{profile.username}</p>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Platinum Member</p>
              
              <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col gap-3">
                 <button 
                   onClick={() => navigate('/change-password')}
                   className="w-full py-3 px-4 bg-gray-50 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-900 hover:text-white transition-all flex items-center justify-center gap-2"
                 >
                   <Shield size={16} /> Change Password
                 </button>

                 <div className="flex items-center gap-3 text-left p-4 bg-gray-50 rounded-2xl">
                    <Award className="text-primary-600" size={20} />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Sky Miles</p>
                      <p className="font-black text-gray-900">12,450</p>
                    </div>
                 </div>
              </div>
            </motion.div>

            <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200">
               <Shield className="text-primary-400 mb-4" size={32} />
               <h4 className="text-lg font-bold mb-2">AeroShield™</h4>
               <p className="text-gray-400 text-sm leading-relaxed">Your data is protected by industry-grade encryption and privacy standards.</p>
            </div>
          </aside>

          {/* EDIT FORM */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-12 rounded-[3.5rem] shadow-xl shadow-blue-900/5 border border-gray-100"
          >
            <h2 className="text-3xl font-display font-black text-gray-900 tracking-tight mb-2">Personal Information</h2>
            <p className="text-gray-500 font-medium mb-10">Manage your member details and travel preferences.</p>

            <form onSubmit={handleUpdate} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      className="input-premium bg-gray-50 pl-12" 
                      value={profile.first_name || ""}
                      onChange={e => setProfile({...profile, first_name: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      className="input-premium bg-gray-50 pl-12" 
                      value={profile.last_name || ""}
                      onChange={e => setProfile({...profile, last_name: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="email"
                      className="input-premium bg-gray-50 pl-12" 
                      value={profile.email || ""}
                      onChange={e => setProfile({...profile, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      className="input-premium bg-gray-50 pl-12" 
                      value={profile.phone_number || ""}
                      onChange={e => setProfile({...profile, phone_number: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-50 pt-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Passport Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      className="input-premium bg-gray-50 pl-12" 
                      placeholder="Enter Passport ID"
                      value={profile.passport_number || ""}
                      onChange={e => setProfile({...profile, passport_number: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="date"
                      className="input-premium bg-gray-50 pl-12" 
                      value={profile.date_of_birth || ""}
                      onChange={e => setProfile({...profile, date_of_birth: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto bg-primary-600 text-white px-12 py-5 rounded-2xl font-bold shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  <Save size={20} /> {saving ? 'Syncing...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
