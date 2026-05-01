import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { useToast } from "../components/Toast";
import { motion } from "framer-motion";
import { Mail, Lock, Plane, ArrowRight, User, ShieldCheck } from "lucide-react";

export default function Login() {
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginUser({ login_input: loginInput, password });
      if (response.status === "success") {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        showToast("Welcome back, " + response.user.name);
        
        // Redirect based on role
        if (response.user.role === 'admin') navigate("/admin");
        else navigate("/flights");
      } else {
        showToast(response.message, "error");
      }
    } catch (err) {
      showToast(err.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 pt-32">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-white p-10 md:p-12 rounded-[3.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
             <Plane size={120} className="rotate-45" />
          </div>

          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-primary-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/30">
              <ShieldCheck size={40} />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Welcome back.</h1>
            <p className="text-gray-500 font-medium mt-2">Sign in to your AeroSpace account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Email or Username"
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 outline-none transition-all placeholder:text-gray-400"
                required
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 outline-none transition-all placeholder:text-gray-400"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="text-right">
               <Link to="/forgot-password" size={18} className="text-xs font-black text-primary-600 uppercase tracking-widest hover:underline">
                 Forgot Password?
               </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black hover:bg-primary-600 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In"} <ArrowRight size={20} />
            </button>
          </form>

          <p className="text-center mt-10 text-gray-500 font-bold text-sm">
            New to AeroSpace?{" "}
            <Link to="/register" className="text-primary-600 hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}