import { useState } from "react";
import { resetPassword } from "../services/api";
import { useToast } from "../components/Toast";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Lock } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return showToast("Passwords do not match", "error");
    
    setLoading(true);
    try {
      const res = await resetPassword({ token, password });
      showToast(res.message);
      navigate('/login');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">Invalid Reset Token</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 pt-32">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-blue-900/10 border border-gray-100 max-w-lg w-full">
        <h2 className="text-3xl font-black text-gray-900 mb-2">Set New Password</h2>
        <p className="text-gray-500 mb-10">Security is our priority. Choose a strong password for your AeroSpace account.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                className="input-premium bg-gray-50 pl-12" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                className="input-premium bg-gray-50 pl-12" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required 
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Updating..." : <>Update Password <ArrowRight size={20}/></>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
