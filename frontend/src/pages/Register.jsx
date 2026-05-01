import { useMemo, useState } from "react";
import { registerUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import { User, Mail, Lock, GraduationCap, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";

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
      <div className="flex items-center justify-center min-h-screen bg-animated px-6">
        <div className="w-full max-w-[460px] glass p-10 rounded-[2rem] text-center border border-white/40 shadow-2xl shadow-blue-900/10">
           <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
             <ShieldCheck size={38} />
           </div>
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
    <div className="flex items-center justify-center min-h-screen bg-animated py-12 px-6">
      
      <div className="w-full max-w-[460px] glass p-10 rounded-[2rem] border border-white/40 shadow-2xl shadow-blue-900/10">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold text-gray-800 tracking-tight tracking-tighter">Create Your Account</h2>
          <p className="text-gray-500 mt-2 font-medium">Start booking premium flights in minutes.</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input className="w-full pl-12 pr-4 py-3.5 bg-white/60 border border-white/30 rounded-xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 transition-all outline-none" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input className="w-full pl-12 pr-4 py-3.5 bg-white/60 border border-white/30 rounded-xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 transition-all outline-none" type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input className="w-full pl-12 pr-12 py-3.5 bg-white/60 border border-white/30 rounded-xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 transition-all outline-none" type={showPassword ? "text" : "password"} placeholder="Password (min 8 chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-primary-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`h-1.5 flex-1 rounded-full ${passwordStrength >= level ? "bg-emerald-500" : "bg-white/50"}`}
              />
            ))}
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
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                <p className="text-[10px] text-emerald-600 font-bold ml-1 uppercase tracking-tighter mb-2">Upload student ID for verification (optional now, required before discount).</p>
                <input type="file" accept="image/*,.pdf" onChange={handleStudentFilePreview} className="text-xs font-semibold text-gray-600" />
                {studentPreview && <img src={studentPreview} alt="Student ID preview" className="mt-3 h-24 rounded-lg border border-emerald-100 object-cover" />}
              </div>
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
