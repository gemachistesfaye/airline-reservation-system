import { useEffect, useState, useRef } from "react";
import { getUserProfile, updateUserProfile } from "../services/api";
import { useToast } from "../components/Toast";
import { motion } from "framer-motion";
import { 
  User, Mail, ShieldCheck, LogOut, Settings, Camera,
  CheckCircle2, ArrowRight, GraduationCap
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", username: "" });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost/airline-reservation-system/backend";
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const res = await getUserProfile();
      setProfile(res.data);
      setEditForm({ name: res.data.name, username: res.data.username || "" });
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("username", editForm.username);
      if (imageFile) formData.append("profile_image", imageFile);

      const res = await updateUserProfile(formData);
      showToast(res.message);
      setIsEditing(false);
      setImageFile(null);
      await loadProfile();
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      storedUser.name = editForm.name;
      localStorage.setItem("user", JSON.stringify(storedUser));
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
           
           {/* SIDEBAR */}
           <aside className="space-y-6">
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-blue-900/5 text-center">
                 
                 {/* AVATAR */}
                 <div
                   className="relative w-24 h-24 mx-auto mb-5 group cursor-pointer"
                   onClick={() => isEditing && fileInputRef.current?.click()}
                 >
                   {imagePreview || profile?.profile_image ? (
                     <img
                       src={imagePreview || `${BASE_URL}/${profile.profile_image}`}
                       alt="Profile"
                       className="w-24 h-24 rounded-[2rem] object-cover shadow-xl"
                     />
                   ) : (
                     <div className="w-24 h-24 bg-primary-600 text-white rounded-[2rem] flex items-center justify-center shadow-xl font-black text-3xl">
                       {profile?.name?.charAt(0)}
                     </div>
                   )}
                   {isEditing && (
                     <div className="absolute inset-0 bg-black/50 rounded-[2rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <Camera size={22} className="text-white" />
                     </div>
                   )}
                   <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleImageChange} />
                 </div>

                 <h2 className="text-xl font-black text-gray-900 tracking-tight">{profile?.name}</h2>
                 <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{profile?.username || "No username"}</p>
                 <p className="text-xs text-gray-400 mt-1 truncate">{profile?.email}</p>

                 {/* STATUS BADGE */}
                 <div className="mt-4 flex items-center justify-center gap-2 text-emerald-600">
                   <ShieldCheck size={14} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Verified Account</span>
                 </div>

                 {/* NAV BUTTONS */}
                 <div className="mt-6 space-y-2">
                   <button
                     className="w-full flex items-center justify-between p-4 rounded-xl bg-primary-600 text-white font-black text-xs uppercase tracking-widest shadow-lg"
                   >
                     <div className="flex items-center gap-2"><Settings size={15}/> Settings</div>
                   </button>
                   <button
                     onClick={() => navigate('/dashboard')}
                     className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900 font-black text-xs uppercase tracking-widest transition-all"
                   >
                     <div className="flex items-center gap-2"><User size={15}/> My Bookings</div>
                     <ArrowRight size={13} />
                   </button>
                 </div>

                 <button
                   onClick={() => { localStorage.clear(); navigate('/login'); }}
                   className="w-full flex items-center justify-center gap-2 p-4 mt-4 border border-red-100 text-red-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all"
                 >
                   <LogOut size={15}/> Sign Out
                 </button>
              </div>

              {/* Student badge if applicable */}
              {profile?.is_student === 1 && (
                <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-xl shadow-blue-900/5">
                  <div className="flex items-center gap-3 mb-2">
                    <GraduationCap size={16} className="text-primary-600" />
                    <h4 className="font-black text-gray-900 text-sm">Student Status</h4>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                    profile.student_verification_status === 'approved'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {profile.student_verification_status === 'approved' ? '✓ Verified — 20% Discount Active' : 'Verification Pending'}
                  </span>
                </div>
              )}
           </aside>

           {/* MAIN CONTENT */}
           <main>
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-blue-900/5"
              >
                 <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Account Settings</h3>
                    <button
                      onClick={() => { setIsEditing(!isEditing); setImagePreview(null); setImageFile(null); }}
                      className="bg-gray-50 text-gray-600 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
                    >
                       {isEditing ? "Cancel" : "Edit Profile"}
                    </button>
                 </div>

                 <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Display Name</label>
                          <input
                            disabled={!isEditing}
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            className="w-full px-5 py-3.5 bg-gray-50 rounded-xl font-bold text-gray-900 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 transition-all disabled:opacity-60 outline-none"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
                          <input
                            disabled={!isEditing}
                            value={editForm.username}
                            onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                            className="w-full px-5 py-3.5 bg-gray-50 rounded-xl font-bold text-gray-900 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 transition-all disabled:opacity-60 outline-none"
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address (Read Only)</label>
                       <input
                         readOnly
                         value={profile.email}
                         className="w-full px-5 py-3.5 bg-gray-50/50 rounded-xl font-bold text-gray-400 border border-gray-100 cursor-not-allowed outline-none"
                       />
                    </div>

                    {isEditing && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        {imagePreview && (
                          <p className="text-xs text-primary-600 font-bold flex items-center gap-2">
                            <CheckCircle2 size={14}/> New photo selected — will be saved on submit
                          </p>
                        )}
                        <button
                          type="submit"
                          className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-primary-600 shadow-xl transition-all flex items-center justify-center gap-3"
                        >
                           Save Changes <CheckCircle2 size={18}/>
                        </button>
                      </motion.div>
                    )}

                    {!isEditing && (
                      <div className="pt-6 border-t border-gray-50">
                        <button
                          type="button"
                          onClick={() => navigate('/change-password')}
                          className="text-primary-600 font-black text-xs uppercase tracking-widest hover:underline flex items-center gap-2"
                        >
                          Change Password <ArrowRight size={14}/>
                        </button>
                      </div>
                    )}
                 </form>
              </motion.div>
           </main>
        </div>
      </div>
    </div>
  );
}
