import { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";

export default function Login() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    if (!email || !password) {
      showToast("Please enter both email and password.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser({ login_input: email, password });
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      
      showToast(res.message);
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
    <div className="flex items-center justify-center min-h-screen bg-animated">
      
      <div className="w-[420px] glass p-10 rounded-[2rem]">
        
        <div className="text-center mb-8">
          <div className="text-5xl mb-4 inline-block transform hover:scale-110 transition-transform duration-300">✈️</div>
          <h2 className="text-3xl font-display font-bold text-gray-800 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-gray-500 mt-2 font-medium">Please enter your details to sign in.</p>
        </div>

        <div className="space-y-4">
          <input
            className="input-premium"
            placeholder="Email or Username"
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="space-y-1">
            <input
              className="input-premium"
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
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
            {loading ? "Signing in..." : "Sign In"}
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