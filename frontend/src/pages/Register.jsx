import { useMemo, useState } from "react";
import { registerUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import { User, Mail, Lock, GraduationCap, ArrowRight, Eye, EyeOff, ShieldCheck, Loader2, Plane, Upload, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Register() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "", user_type: "regular" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [studentPreview, setStudentPreview] = useState("");
  const navigate = useNavigate();

  const [success, setSuccess] = useState(false);
  const passwordStrength = useMemo(() => {
    const value = form.password || "";
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    return score;
  }, [form.password]);

  const register = async () => {
    if (!form.name || !form.email || !form.password) {
      return showToast("Please fill all required fields", "error");
    }
    if (!/\S+@\S+\.\S+/.test(form.email.trim())) {
      return showToast("Please enter a valid email address.", "error");
    }
    if (form.password.length < 8) {
      return showToast("Password must be at least 8 characters.", "error");
    }
    setLoading(true);
    try {
      const res = await registerUser({ ...form, email: form.email.trim(), name: form.name.trim() });
      showToast(res.message);
      setSuccess(true);
    } catch (e) {
      showToast(e.message, "error");
    }
    setLoading(false);
  };

  const handleStudentFilePreview = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith("image/")) {
      setStudentPreview(URL.createObjectURL(file));
    } else {
      setStudentPreview("");
    }
  };

  if (success) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#f8fafc] overflow-hidden">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-[480px] z-10 px-6 text-center"
        >
          <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-gray-100">
             <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/10">
               <ShieldCheck size={48} />
             </div>
             <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Verify Your Email</h2>
             <p className="text-gray-500 font-medium mb-10 leading-relaxed">
               We've sent a secure verification link to <strong className="text-gray-900">{form.email}</strong>. 
               Please click it to activate your account.
             </p>
             <button 
                onClick={() => navigate('/login')} 
                className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 group shadow-xl shadow-gray-200"
              >
               Proceed to Login <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
             </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#f8fafc] py-20 overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-600/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/5 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[500px] z-10 px-6"
      >
        <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-gray-100">
          
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-primary-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/30"
            >
              <Plane size={32} className="rotate-[-45deg]" />
            </motion.div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Join AeroSpace</h2>
            <p className="text-gray-500 font-medium">Create your account for premium travel experiences</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 focus:bg-white focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 outline-none transition-all placeholder:text-gray-300" 
                  placeholder="John Doe" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 focus:bg-white focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 outline-none transition-all placeholder:text-gray-300" 
                  type="email" 
                  placeholder="john@example.com" 
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                <input 
                  className="w-full pl-12 pr-14 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 focus:bg-white focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 outline-none transition-all placeholder:text-gray-300" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={form.password} 
                  onChange={(e) => setForm({ ...form, password: e.target.value })} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="flex gap-2 px-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${passwordStrength >= level ? "bg-emerald-500" : "bg-gray-100"}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Traveler Type</label>
              <div className="grid grid-cols-2 gap-4">
                 <button 
                  type="button"
                  onClick={() => setForm({...form, user_type: 'regular'})}
                  className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black transition-all ${form.user_type === 'regular' ? 'bg-gray-900 text-white shadow-xl shadow-gray-200' : 'bg-gray-50 text-gray-400 border border-gray-100 hover:border-gray-200'}`}
                 >
                   Standard
                 </button>
                 <button 
                  type="button"
                  onClick={() => setForm({...form, user_type: 'student'})}
                  className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black transition-all ${form.user_type === 'student' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-gray-50 text-gray-400 border border-gray-100 hover:border-gray-200'}`}
                 >
                   <GraduationCap size={20}/> Student
                 </button>
              </div>
              
              <AnimatePresence>
                {form.user_type === 'student' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-[2rem] border-2 border-dashed border-emerald-100 bg-emerald-50/50 p-6 mt-2">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                           <Upload size={20} className="text-emerald-600" />
                        </div>
                        <p className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-1">Upload Student ID</p>
                        <p className="text-[10px] text-emerald-600/70 font-medium mb-4">Required for 20% discount eligibility</p>
                        
                        <label className="inline-block px-6 py-2.5 bg-white text-emerald-600 font-bold text-xs rounded-xl shadow-sm border border-emerald-100 cursor-pointer hover:bg-emerald-50 transition-colors">
                          Choose File
                          <input type="file" accept="image/*,.pdf" onChange={handleStudentFilePreview} className="hidden" />
                        </label>
                      </div>

                      {studentPreview && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-6 relative group"
                        >
                          <img src={studentPreview} alt="Student ID preview" className="w-full h-32 rounded-2xl border border-white shadow-md object-cover" />
                          <div className="absolute inset-0 bg-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                             <CheckCircle2 size={32} className="text-white" />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={register}
              disabled={loading}
              className="w-full bg-primary-600 text-white font-black py-4 rounded-2xl hover:bg-primary-700 shadow-2xl shadow-primary-500/30 transition-all active:scale-[0.98] mt-4 disabled:opacity-70 flex justify-center items-center gap-3 group"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-50 text-center">
            <p className="text-gray-500 font-bold text-sm">
              Already have an account?
              <span onClick={() => navigate("/login")} className="text-primary-600 font-black hover:text-primary-700 cursor-pointer ml-2 transition-colors">
                Sign In
              </span>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
