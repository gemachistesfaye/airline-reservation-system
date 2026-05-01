import { useState, useEffect } from "react";
import { getUserProfile, updateUserProfile, uploadStudentId } from "../services/api";
import { useToast } from "../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Shield, Save, GraduationCap, Upload, Loader2, Camera, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost/airline-reservation-system/backend";

export default function Profile() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "user",
    user_type: "regular",
    student_verified: 0,
    student_verification_status: "none",
    student_id_file: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [studentFile, setStudentFile] = useState(null);
  const [studentPreview, setStudentPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getUserProfile()
      .then((res) => {
        setProfile(res.data);
      })
      .catch((err) => showToast(err.message, "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateUserProfile({
        name: profile.name,
        user_type: profile.user_type
      });
      showToast(res.message);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...user, ...profile }));
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleStudentFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setStudentFile(file);
    if (file.type.startsWith("image/")) {
      setStudentPreview(URL.createObjectURL(file));
    } else {
      setStudentPreview("");
    }
  };

  const submitStudentId = async () => {
    if (!studentFile) {
      showToast("Please choose a student ID file first.", "warning");
      return;
    }
    setUploading(true);
    try {
      const res = await uploadStudentId(studentFile);
      showToast(res.message);
      const profileRes = await getUserProfile();
      setProfile(profileRes.data);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...user, ...profileRes.data }));
      setStudentFile(null);
      setStudentPreview("");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
      <p className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Loading Profile...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-40 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* LEFT COLUMN: IDENTITY */}
          <aside className="w-full lg:w-96 shrink-0 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100 relative overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gray-900/5" />
              <div className="relative pt-8">
                <div className="w-32 h-32 bg-white text-gray-900 rounded-[2.5rem] flex items-center justify-center text-4xl font-black mx-auto mb-6 shadow-2xl border-4 border-white">
                  {String(profile.name || "U").charAt(0).toUpperCase()}
                </div>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{profile.name}</h3>
                <p className="text-gray-400 font-bold text-sm mt-1 mb-6">{profile.email}</p>
                
                <div className="flex flex-wrap justify-center gap-2">
                   <span className="px-4 py-1.5 rounded-xl bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest">{profile.role}</span>
                   {profile.user_type === 'student' && (
                     <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${profile.student_verified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        <GraduationCap size={12}/> {profile.student_verified ? 'Verified Student' : 'Student Status'}
                     </span>
                   )}
                </div>
              </div>

              <div className="mt-10 pt-10 border-t border-gray-50 flex flex-col gap-3">
                 <button onClick={() => navigate("/change-password")} className="w-full py-4 px-6 bg-gray-50 text-gray-600 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95">
                    <Shield size={16} /> Security Settings
                 </button>
              </div>
            </motion.div>

            {/* Travel Summary Stats */}
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                   <h4 className="text-xl font-black text-gray-900">Tier One</h4>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Travels</p>
                   <h4 className="text-xl font-black text-gray-900">4 Flights</h4>
                </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: SETTINGS */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="flex-1 space-y-8"
          >
            <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-3 leading-none">Identity & Access</h2>
              <p className="text-gray-400 font-bold mb-12">Update your personal information and verification documents.</p>

              <form onSubmit={handleUpdate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Name</label>
                    <div className="relative group">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-600 transition-colors" size={20} />
                      <input 
                        className="w-full pl-16 pr-8 py-5 bg-gray-50 border-none rounded-[1.5rem] font-black text-gray-900 focus:bg-white focus:ring-4 focus:ring-primary-600/5 transition-all outline-none" 
                        value={profile.name || ""} 
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Connection</label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                      <input 
                        type="email" 
                        className="w-full pl-16 pr-8 py-5 bg-gray-50/50 border-none rounded-[1.5rem] font-black text-gray-400 cursor-not-allowed" 
                        value={profile.email || ""} 
                        disabled 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-50">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-6 block">Classification Status</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      type="button" 
                      onClick={() => setProfile({ ...profile, user_type: "regular" })} 
                      className={`flex items-center justify-between px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${profile.user_type !== "student" ? "bg-gray-900 text-white shadow-2xl" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
                    >
                      Regular Traveler {profile.user_type !== 'student' && <CheckCircle2 size={18}/>}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setProfile({ ...profile, user_type: "student" })} 
                      className={`flex items-center justify-between px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${profile.user_type === "student" ? "bg-emerald-600 text-white shadow-2xl shadow-emerald-500/20" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
                    >
                      Student Tier {profile.user_type === 'student' && <GraduationCap size={18}/>}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {profile.user_type === "student" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-[2.5rem] border border-emerald-100 bg-emerald-50/30 p-10 mt-4">
                        <div className="flex flex-col md:flex-row items-center gap-10">
                           <div className="w-full md:w-56 h-40 bg-white rounded-3xl overflow-hidden border border-emerald-100 shadow-xl flex flex-col items-center justify-center relative group">
                              {studentPreview ? (
                                <img src={studentPreview} alt="Preview" className="w-full h-full object-cover" />
                              ) : profile.student_id_file ? (
                                <img src={`${API_BASE}/${profile.student_id_file}`} alt="Existing ID" className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-center p-4">
                                   <Camera className="text-emerald-200 mx-auto mb-2" size={32} />
                                   <span className="text-[9px] font-black uppercase text-emerald-400">No Image Selected</span>
                                </div>
                              )}
                              <label className="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer gap-2">
                                 <Upload size={20} />
                                 <span className="text-[10px] font-black uppercase">Change File</span>
                                 <input type="file" accept="image/*,.pdf" onChange={handleStudentFileChange} className="hidden" />
                              </label>
                           </div>
                           
                           <div className="flex-1 text-center md:text-left">
                              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                                 <h4 className="text-xl font-black text-gray-900">Student Verification</h4>
                                 <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${profile.student_verification_status === 'approved' ? 'bg-emerald-100 text-emerald-700' : profile.student_verification_status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-600'}`}>
                                    {profile.student_verification_status}
                                 </span>
                              </div>
                              <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
                                 Submit a valid student ID to unlock a 15% discount on all flights. Our team will review your submission within 24 hours.
                              </p>
                              
                              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                {studentFile && (
                                  <button type="button" onClick={submitStudentId} disabled={uploading} className="bg-gray-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200">
                                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Upload & Verify
                                  </button>
                                )}
                                {profile.student_id_file && (
                                  <a href={`${API_BASE}/${profile.student_id_file}`} target="_blank" rel="noreferrer" className="bg-white text-gray-900 border border-gray-100 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-gray-50 transition-all shadow-sm">
                                    <ExternalLink size={16} /> View Current ID
                                  </a>
                                )}
                              </div>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-10 flex justify-end">
                   <button 
                     type="submit" 
                     disabled={saving} 
                     className="w-full sm:w-auto bg-primary-600 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50"
                   >
                     {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} Commit Changes
                   </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
