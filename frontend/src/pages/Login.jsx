import { useMemo, useState } from "react";
import { loginUser } from "../services/api";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Loader2, ArrowRight, Plane } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const { showToast } = useToast();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const verified = useMemo(
    () => new URLSearchParams(location.search).get("verified") === "true",
    [location.search]
  );

  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

  const login = async () => {
    if (!email || !password) {
      return showToast("Please enter both email and password.", "error");
    }
    if (!isValidEmail(email.trim())) {
      return showToast("Please enter a valid email address.", "error");
    }

    setLoading(true);
    try {
      const res = await loginUser({ email: email.trim(), password });
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      
      showToast(res.message || "Welcome back!");
      if (res.user.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/flights");
      }
    } catch (e) {
      showToast(e.message, "error");
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#f8fafc] overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[480px] z-10 px-6"
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
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Welcome Back</h2>
            <p className="text-gray-500 font-medium">Log in to manage your premium travel</p>
          </div>

          {verified && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 flex items-center gap-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl px-5 py-4"
            >
              <ShieldCheck size={20} />
              <p className="text-sm font-bold">Email verified! You can now sign in.</p>
            </motion.div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                <input
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 focus:bg-white focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 outline-none transition-all placeholder:text-gray-300"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && login()}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Password
                </label>
                <span 
                  onClick={() => navigate("/forgot-password")}
                  className="text-[11px] font-black text-primary-600 hover:text-primary-700 cursor-pointer uppercase tracking-widest transition-colors"
                >
                  Forgot?
                </span>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                <input
                  className="w-full pl-12 pr-14 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 focus:bg-white focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 outline-none transition-all placeholder:text-gray-300"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && login()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              onClick={login}
              disabled={loading}
              className="w-full bg-primary-600 text-white font-black py-4 rounded-2xl hover:bg-primary-700 hover:shadow-2xl hover:shadow-primary-500/30 transition-all active:scale-[0.98] flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-50 text-center">
            <p className="text-gray-500 font-bold text-sm">
              Don't have an account?
              <span
                onClick={() => navigate("/register")}
                className="text-primary-600 font-black hover:text-primary-700 cursor-pointer ml-2 transition-colors inline-flex items-center gap-1 group"
              >
                Register Now
              </span>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

  );
}