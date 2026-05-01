import { useState, useEffect } from "react";
import { getUserProfile, updateUserProfile, uploadStudentId } from "../services/api";
import { useToast } from "../components/Toast";
import { motion } from "framer-motion";
import { User, Mail, Shield, Save, GraduationCap, Upload, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          <aside className="space-y-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-gray-100 text-center">
              <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-3xl flex items-center justify-center text-3xl font-black mx-auto mb-5">
                {String(profile.name || "U").charAt(0).toUpperCase()}
              </div>
              <h3 className="text-2xl font-black text-gray-900">{profile.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{profile.email}</p>
              <span className="inline-flex mt-4 rounded-full bg-primary-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary-700">
                {profile.role}
              </span>

              <button onClick={() => navigate("/change-password")} className="w-full mt-6 py-3 px-4 bg-gray-50 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-900 hover:text-white transition-all flex items-center justify-center gap-2">
                <Shield size={16} /> Change Password
              </button>
            </motion.div>
          </aside>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-10 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-gray-100">
            <h2 className="text-3xl font-display font-black text-gray-900 tracking-tight mb-2">Profile Settings</h2>
            <p className="text-gray-500 font-medium mb-8">Manage account details and student verification.</p>

            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input className="input-premium bg-gray-50 pl-12" value={profile.name || ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" className="input-premium bg-gray-50 pl-12" value={profile.email || ""} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Are you a student?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setProfile({ ...profile, user_type: "regular" })} className={`rounded-xl px-4 py-3 font-bold ${profile.user_type !== "student" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-600"}`}>No</button>
                  <button type="button" onClick={() => setProfile({ ...profile, user_type: "student" })} className={`rounded-xl px-4 py-3 font-bold inline-flex items-center justify-center gap-2 ${profile.user_type === "student" ? "bg-emerald-500 text-white" : "bg-gray-50 text-gray-600"}`}>
                    <GraduationCap size={16} /> Yes
                  </button>
                </div>
              </div>

              {profile.user_type === "student" && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                  <p className="text-sm font-semibold text-emerald-700 mb-2">
                    Verification status: {profile.student_verification_status === "approved" ? "Approved" : profile.student_verification_status === "rejected" ? "Rejected" : profile.student_verification_status === "pending" ? "Pending verification" : "Not submitted"}
                  </p>
                  <input type="file" accept="image/*,.pdf" onChange={handleStudentFileChange} className="block w-full text-sm mb-3" />
                  {studentPreview && <img src={studentPreview} alt="Student ID preview" className="h-32 rounded-xl border border-emerald-100 object-cover mb-3" />}
                  <button type="button" onClick={submitStudentId} disabled={uploading} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white font-bold hover:bg-emerald-700 disabled:opacity-60">
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Upload student ID
                  </button>
                </div>
              )}

              <button type="submit" disabled={saving} className="w-full md:w-auto bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                <Save size={20} /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
