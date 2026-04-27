import { useState } from "react";
import { forgotPassword } from "../services/api";
import { useToast } from "../components/Toast";
import { motion } from "framer-motion";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await forgotPassword({ email });
      showToast(res.message);
      setSent(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Check Your Inbox</h2>
          <p className="text-gray-500 mb-8">We've sent a recovery link to <strong>{email}</strong>. It will expire in 1 hour.</p>
          <button onClick={() => navigate('/login')} className="text-primary-600 font-bold hover:gap-3 flex items-center justify-center gap-2 mx-auto transition-all">
            Back to Login <ArrowRight size={20}/>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 pt-32">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-blue-900/10 border border-gray-100 max-w-lg w-full">
        <h2 className="text-3xl font-black text-gray-900 mb-2">Recover Access</h2>
        <p className="text-gray-500 mb-10">Enter your email and we'll send you a link to reset your password.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                className="input-premium bg-gray-50 pl-12" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="passenger@example.com"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Processing..." : <>Send Recovery Link <ArrowRight size={20}/></>}
          </button>
          
          <button type="button" onClick={() => navigate('/login')} className="w-full text-gray-400 font-bold text-sm hover:text-gray-900 transition-colors mt-4">
            I remember my password
          </button>
        </form>
      </motion.div>
    </div>
  );
}
