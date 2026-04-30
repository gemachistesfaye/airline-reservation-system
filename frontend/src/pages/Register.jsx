import { useState } from "react";
import { registerUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import { User, Mail, Lock, GraduationCap, ArrowRight } from "lucide-react";

export default function Register() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "", user_type: "regular" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [success, setSuccess] = useState(false);

  const register = async () => {
    if (!form.name || !form.email || !form.password) {
      return showToast("Please fill all required fields", "warning");
    }
    setLoading(true);
    try {
      const res = await registerUser(form);
      showToast(res.message);
      setSuccess(true);
    } catch (e) {
      showToast(e.message, "error");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-animated">
        <div className="w-[450px] glass p-10 rounded-[2rem] text-center">
           <div className="text-6xl mb-6">📧</div>
           <h2 className="text-3xl font-display font-bold text-gray-800 tracking-tight mb-4">Verify Your Email</h2>
           <p className="text-gray-500 mb-8 font-medium">We've sent a verification link to <strong>{form.email}</strong>. Please check your inbox to activate your account.</p>
           <button onClick={() => navigate('/login')} className="text-primary-600 font-bold hover:underline flex items-center justify-center gap-2 mx-auto">
             Proceed to Login <ArrowRight size={18}/>
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-animated py-12">
      
      <div className="w-[450px] glass p-10 rounded-[2rem]">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold text-gray-800 tracking-tight tracking-tighter">Join AeroSpace</h2>
          <p className="text-gray-500 mt-2 font-medium">Create your account to start your journey.</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-white/20 rounded-xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 transition-all outline-none" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-white/20 rounded-xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 transition-all outline-none" type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-white/20 rounded-xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 transition-all outline-none" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Type</label>
            <div className="grid grid-cols-2 gap-3">
               <button 
                type="button"
                onClick={() => setForm({...form, user_type: 'regular'})}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${form.user_type === 'regular' ? 'bg-gray-900 text-white shadow-lg' : 'bg-white/50 text-gray-500 border border-white/20'}`}
               >
                 Regular
               </button>
               <button 
                type="button"
                onClick={() => setForm({...form, user_type: 'student'})}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${form.user_type === 'student' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white/50 text-gray-500 border border-white/20'}`}
               >
                 <GraduationCap size={16}/> Student
               </button>
            </div>
            {form.user_type === 'student' && (
              <p className="text-[10px] text-emerald-600 font-bold ml-1 uppercase tracking-tighter">🎓 20% Discount automatically applied to all bookings!</p>
            )}
          </div>

          <button
            onClick={register}
            disabled={loading}
            className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl hover:bg-primary-700 shadow-xl shadow-primary-500/20 transition-all active:scale-[0.98] mt-6 disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {loading ? "Initializing..." : "Create Account"}
          </button>
        </div>

        <p className="text-center text-gray-500 font-medium text-sm mt-8">
          Already have an account?
          <span onClick={() => navigate("/login")} className="text-gray-900 font-black hover:underline cursor-pointer ml-1.5 transition-colors">
            Sign In
          </span>
        </p>

      </div>
    </div>
  );
}