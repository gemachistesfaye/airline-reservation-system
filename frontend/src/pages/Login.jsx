import { useMemo, useState } from "react";
import { loginUser } from "../services/api";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Loader2 } from "lucide-react";

export default function Login() {
  const { showToast } = useToast();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState("");
  const navigate = useNavigate();
  const verified = useMemo(
    () => new URLSearchParams(location.search).get("verified") === "true",
    [location.search]
  );

  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

  const login = async () => {
    if (!email || !password) {
      setInlineError("Please enter both email and password.");
      showToast("Please enter both email and password.", "error");
      return;
    }
    if (!isValidEmail(email.trim())) {
      setInlineError("Please enter a valid email address.");
      showToast("Please enter a valid email address.", "error");
      return;
    }

    setInlineError("");
    setLoading(true);
    try {
      const res = await loginUser({ email: email.trim(), password });
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      
      showToast(res.message || "Login successful.");
      if (res.user.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/flights");
      }
    } catch (e) {
      setInlineError(e.message);
      showToast(e.message, "error");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-animated px-6">
      
      <div className="w-full max-w-[460px] glass p-10 rounded-[2rem] border border-white/40 shadow-2xl shadow-blue-900/10">
        
        <div className="text-center mb-8">
          <div className="text-5xl mb-4 inline-block transform hover:scale-110 transition-transform duration-300">✈️</div>
          <h2 className="text-3xl font-display font-bold text-gray-800 tracking-tight">
            Sign In Securely
          </h2>
          <p className="text-gray-500 mt-2 font-medium">Access your reservations, payments, and tickets.</p>
        </div>

        {verified && (
          <div className="mb-6 flex items-center gap-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl px-4 py-3">
            <ShieldCheck size={18} />
            <p className="text-sm font-semibold">Email verified. You can now log in.</p>
          </div>
        )}

        <div className="space-y-5">
          {inlineError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {inlineError}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                className="w-full pl-12 pr-4 py-3.5 bg-white/70 border border-white/30 rounded-xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                className="w-full pl-12 pr-12 py-3.5 bg-white/70 border border-white/30 rounded-xl font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex justify-end pr-1">
              <span 
                onClick={() => navigate("/forgot-password")}
                className="text-[12px] font-bold text-gray-400 hover:text-primary-600 cursor-pointer transition-colors"
              >
                Forgot Password?
              </span>
            </div>
          </div>

          <button
            onClick={login}
            disabled={loading}
            className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-[0.98] mt-2 disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Signing in...</span> : "Sign In"}
          </button>
        </div>

        <p className="text-center text-gray-500 font-medium text-sm mt-8">
          Don’t have an account?
          <span
            onClick={() => navigate("/register")}
            className="text-primary-600 font-bold hover:text-primary-700 cursor-pointer ml-1.5 transition-colors"
          >
            Register now
          </span>
        </p>

      </div>
    </div>
  );
}