import { useState } from "react";
import { changePassword } from "../services/api";
import { useToast } from "../components/Toast";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, ArrowRight, Key, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ old_password: "", new_password: "", confirm_password: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password.length < 8) return showToast("New password must be at least 8 characters.", "error");
    if (form.new_password !== form.confirm_password) return showToast("Passwords do not match", "error");
    
    setLoading(true);
    try {
      const res = await changePassword(form);
      showToast(res.message);
      navigate('/profile');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 pt-32">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-blue-900/10 border border-gray-100 max-w-lg w-full">
        <h2 className="text-3xl font-black text-gray-900 mb-2">Change Password</h2>
        <p className="text-gray-500 mb-10">Update your security credentials regularly to keep your AeroSpace account safe.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type={showCurrent ? "text" : "password"}
                className="input-premium bg-gray-50 pl-12 pr-12" 
                value={form.old_password} 
                onChange={e => setForm({...form, old_password: e.target.value})} 
                required 
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-primary-600 transition-colors"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type={showNew ? "text" : "password"}
                className="input-premium bg-gray-50 pl-12 pr-12" 
                value={form.new_password} 
                onChange={e => setForm({...form, new_password: e.target.value})} 
                required 
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-primary-600 transition-colors"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type={showConfirm ? "text" : "password"}
                className="input-premium bg-gray-50 pl-12 pr-12" 
                value={form.confirm_password} 
                onChange={e => setForm({...form, confirm_password: e.target.value})} 
                required 
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-primary-600 transition-colors"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Updating..." : <>Update Credentials <ArrowRight size={20}/></>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
